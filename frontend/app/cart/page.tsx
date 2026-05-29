'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import CartItemCard from '@/components/CartItemCard';
import { useAuth } from '@/contexts/AuthContext';

type CheckoutForm = {
  shipping_address: string;
  city: string;
  country: string;
  phone_number: string;
  payment_method: string;
};

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutForm>({
    shipping_address: '',
    city: '',
    country: '',
    phone_number: '',
    payment_method: 'card',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
      setError(null);
      setCheckoutMessage(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    setCheckoutMessage(null);

    try {
      const response = await api.get('orders/cart/');
      setCart(response.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de récupérer le panier.');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: number) => {
    if (!isAuthenticated) {
      setError('Vous devez être connecté pour modifier votre panier.');
      return;
    }

    try {
      await api.delete(`orders/cart/item/${id}/delete/`);
      fetchCart();
    } catch (err) {
      console.error(err);
      setError('Impossible de supprimer cet article.');
    }
  };

  const totalPrice = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum: number, item: any) => {
      return sum + Number(item.product_detail.price) * item.quantity;
    }, 0);
  }, [cart]);

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setError('Vous devez vous connecter pour finaliser la commande.');
      return;
    }

    setError(null);
    setCheckoutMessage(null);

    try {
      const response = await api.post('orders/checkout/', formData);
      setCheckoutMessage(`Commande créée (#${response.data.order_id}).`);
      fetchCart();
    } catch (err) {
      console.error(err);
      setError('Impossible de finaliser le paiement.');
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl bg-white p-8 shadow-lg shadow-slate-200/60">
          <h1 className="text-3xl font-bold">Mon panier</h1>
          <p className="mt-2 text-slate-600">Gérez votre panier et passez commande facilement.</p>
        </section>

        {!isAuthenticated ? (
          <section className="rounded-3xl bg-amber-50 p-8 text-amber-700 shadow-lg shadow-amber-200/70">
            <h2 className="text-xl font-semibold">Connexion requise</h2>
            <p className="mt-2">Vous devez être connecté pour accéder à votre panier et finaliser une commande.</p>
            <Link href="/login" className="mt-4 inline-flex rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700">
              Se connecter
            </Link>
          </section>
        ) : null}

        {error ? (
          <div className="rounded-3xl bg-rose-50 p-6 text-rose-700 shadow-lg shadow-rose-200/70">{error}</div>
        ) : null}

        {loading ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-lg shadow-slate-200/60">Chargement du panier...</section>
        ) : isAuthenticated ? (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-5">
              {cart?.items?.length ? (
                cart.items.map((item: any) => (
                  <CartItemCard key={item.id} item={item} onRemove={removeItem} />
                ))
              ) : (
                <section className="rounded-3xl bg-white p-10 text-center shadow-lg shadow-slate-200/60">
                  <p className="text-xl font-semibold text-slate-900">Votre panier est vide.</p>
                </section>
              )}
            </div>

            <aside className="space-y-5 rounded-3xl bg-white p-8 shadow-lg shadow-slate-200/60">
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Total actuel</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">${totalPrice.toFixed(2)}</p>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Adresse de livraison</label>
                  <textarea
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Ville
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Pays
                    <input
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                      required
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium text-slate-700">
                  Téléphone
                  <input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Méthode de paiement
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="card">Carte</option>
                    <option value="mobile">Mobile</option>
                    <option value="cash">Espèces</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Passer commande
                </button>
                {checkoutMessage ? (
                  <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{checkoutMessage}</p>
                ) : null}
              </form>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}
