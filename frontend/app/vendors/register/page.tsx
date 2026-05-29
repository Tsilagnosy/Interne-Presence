'use client';

import React, { useState } from 'react';
import api from '@/services/api';

export default function VendorRegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    store_name: '',
    slug: '',
    country: '',
    city: '',
    payNow: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload: any = {
        email: form.email,
        password: form.password,
        username: form.username || form.email,
        store_name: form.store_name,
        slug: form.slug,
        country: form.country,
        city: form.city,
      };

      const res = await api.post('vendors/register/', payload);
      const vendorId = res.data.vendor_id;

      if (form.payNow) {
        // create subscription payment
        const amount = process.env.NEXT_PUBLIC_VENDOR_SUBSCRIPTION_PRICE || '49.99';
        const payRes = await api.post('payments/paypal/subscription/create/', {
          vendor_id: vendorId,
          amount,
        });

        if (payRes.data.approval_url) {
          window.location.href = payRes.data.approval_url;
          return;
        }

        setMessage('Erreur création du paiement');
      } else {
        setMessage('Vendeur créé. Pensez à payer pour activer l\'abonnement.');
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.errors || err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Créer un compte vendeur</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full" />
        <input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} className="w-full" />
        <input name="username" placeholder="Nom d'utilisateur (optionnel)" value={form.username} onChange={handleChange} className="w-full" />
        <input name="store_name" placeholder="Nom du magasin" value={form.store_name} onChange={handleChange} className="w-full" />
        <input name="slug" placeholder="Slug du magasin" value={form.slug} onChange={handleChange} className="w-full" />
        <input name="country" placeholder="Pays" value={form.country} onChange={handleChange} className="w-full" />
        <input name="city" placeholder="Ville" value={form.city} onChange={handleChange} className="w-full" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="payNow" checked={form.payNow} onChange={handleChange} />
          Payer maintenant l\'abonnement (6 mois)
        </label>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'En cours...' : 'Créer le compte'}
        </button>
      </form>
      {message && <div className="mt-4 text-sm text-red-600">{JSON.stringify(message)}</div>}
    </div>
  );
}
