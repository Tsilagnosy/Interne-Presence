'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-lg shadow-slate-200/60">
        <h1 className="text-3xl font-bold">Espace Admin</h1>
        <p className="mt-4 text-slate-600">
          {isAuthenticated
            ? 'Bienvenue dans la zone d’administration. Vous pouvez gérer les produits, commandes et abonnements.'
            : 'Connectez-vous d’abord pour accéder aux outils de gestion.'}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/login" className="rounded-3xl border border-slate-200 px-6 py-5 text-left hover:bg-slate-50">
            <h2 className="text-xl font-semibold">Connexion</h2>
            <p className="mt-2 text-sm text-slate-600">Connectez-vous au back-office.</p>
          </Link>
          <Link href="/vendors/register" className="rounded-3xl border border-slate-200 px-6 py-5 text-left hover:bg-slate-50">
            <h2 className="text-xl font-semibold">Inscription vendeur</h2>
            <p className="mt-2 text-sm text-slate-600">Créez un espace vendeur et payez l’abonnement.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
