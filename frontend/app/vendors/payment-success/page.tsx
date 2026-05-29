'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/src/services/api';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Traitement du paiement...');

  useEffect(() => {
    const paymentId = searchParams.get('paymentId') || searchParams.get('paymentID') || '';
    const payerId = searchParams.get('PayerID') || '';
    const vendorId = searchParams.get('vendor_id') || '';

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
  }, [searchParams]);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Paiement</h1>
      <div>{message}</div>
    </div>
  );
}
