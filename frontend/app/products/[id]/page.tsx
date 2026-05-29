'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`products/${productId}/`);
      setProduct(response.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger ce produit.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!isAuthenticated) {
      setError('Vous devez vous connecter pour ajouter ce produit au panier.');
      return;
    }

    setMessage(null);
    setError(null);

    try {
      await api.post('orders/cart/add/', { product: product.id });
      setMessage('Produit ajouté au panier.');
    } catch (err) {
      console.error(err);
      setError('Impossible d’ajouter le produit au panier.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
          <div>
            <h1 className="text-3xl font-bold">Détail du produit</h1>
            <p className="mt-2 text-sm text-slate-600">Page produit disponible depuis l’API.</p>
          </div>
          <Link href="/cart" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
            Voir le panier
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-lg font-medium text-slate-700 shadow-lg shadow-slate-200/60">
            Chargement...
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-rose-50 p-8 text-rose-700 shadow-lg shadow-rose-200/70">{error}</div>
        ) : product ? (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl bg-white p-8 shadow-lg shadow-slate-200/60">
              <h2 className="text-4xl font-bold text-slate-900">{product.name}</h2>
              <p className="mt-4 text-slate-600">{product.description}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
                {product.vendor_name && <span className="rounded-full bg-slate-100 px-3 py-1">Vendeur : {product.vendor_name}</span>}
                {product.category_name && <span className="rounded-full bg-slate-100 px-3 py-1">Catégorie : {product.category_name}</span>}
                {product.city && <span className="rounded-full bg-slate-100 px-3 py-1">Ville : {product.city}</span>}
                {product.country && <span className="rounded-full bg-slate-100 px-3 py-1">Pays : {product.country}</span>}
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <p className="text-3xl font-bold text-slate-900">${product.price}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={!isAuthenticated}
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    Ajouter au panier
                  </button>
                  {!isAuthenticated ? (
                    <Link
                      href="/login"
                      className="rounded-full border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      Connexion requise
                    </Link>
                  ) : null}
                </div>
              </div>
              {message && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
                <h3 className="text-xl font-semibold text-slate-900">Détails</h3>
                <ul className="mt-4 space-y-3 text-slate-600">
                  <li>Stock : {product.stock_quantity}</li>
                  <li>Type : {product.product_type}</li>
                  <li>Livraison : {product.delivery_time}</li>
                  <li>Prix promo : {product.discount_price ? `$${product.discount_price}` : 'Aucun'}</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center text-lg text-slate-700 shadow-lg shadow-slate-200/60">
            Produit introuvable.
          </div>
        )}
      </div>
    </main>
  );
}
