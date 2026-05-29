'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';

export const dynamic = 'force-dynamic';

export default function PaymentSuccessPage() {
  const [message, setMessage] = useState('Traitement du paiement...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('paymentId') || params.get('paymentID') || '';
    const payerId = params.get('PayerID') || '';
    const vendorId = params.get('vendor_id') || '';

    if (!paymentId || !payerId || !vendorId) {
      setMessage('Paramètres manquants.');
      return;
    }

    (async () => {
      try {
        const res = await api.post('payments/paypal/subscription/execute/', {
          paymentId,
          PayerID: payerId,
          vendor_id: vendorId,
        });

        setMessage('Paiement confirmé. Abonnement activé jusqu\'à ' + new Date(res.data.end_date).toLocaleString());
      } catch (err: any) {
        setMessage('Erreur lors de l\'exécution du paiement: ' + (err?.response?.data || err.message));
      }
    })();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Paiement</h1>
      <div>{message}</div>
    </div>
  );
}
