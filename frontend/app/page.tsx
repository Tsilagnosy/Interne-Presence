'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import ProductCard from '@/components/ProductCard';

export type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  vendor_name?: string;
  category_name?: string;
  city?: string;
  country?: string;
  is_active?: boolean;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('products/');
      setProducts(response.data.results || []);
    } catch (error) {
      console.error(error);
      setError('Impossible de charger les produits. Vérifiez que le backend est démarré et accessible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <header className="mb-10 rounded-3xl bg-white/90 p-8 shadow-lg shadow-slate-200/80 backdrop-blur-sm">
          <h1 className="text-5xl font-bold tracking-tight">AfriMarket</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Marketplace multi-vendeur pour l'Afrique. Découvrez les produits, explorez les vendeurs et achetez en toute simplicité.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              En ligne avec le backend
            </span>
            <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
              Next.js + TypeScript
            </span>
          </div>
        </header>

        {error ? (
          <div className="rounded-3xl bg-rose-50 border border-rose-200 p-6 text-rose-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg shadow-slate-200/60">
            <p className="text-xl font-semibold">Chargement des produits...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {products.length > 0 ? (
              products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="block">
                  <ProductCard product={product} />
                </Link>
              ))
            ) : (
              <div className="rounded-3xl bg-white p-8 text-center shadow-lg shadow-slate-200/60">
                <p className="text-xl font-semibold">Aucun produit disponible pour l'instant.</p>
                <p className="mt-2 text-slate-600">Ajoutez des produits depuis le backend ou vérifiez l'endpoint.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
