'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          AfriMarket
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link href="/" className="transition hover:text-slate-900">
            Produits
          </Link>
          <Link href="/cart" className="rounded-full border border-slate-200 px-4 py-2 transition hover:bg-slate-50">
            Panier
          </Link>
          <Link href="/admin" className="rounded-full border border-slate-200 px-4 py-2 transition hover:bg-slate-50">
            Admin
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700 transition hover:bg-rose-100"
            >
              Déconnexion
            </button>
          ) : (
            <Link href="/login" className="rounded-full border border-slate-200 px-4 py-2 transition hover:bg-slate-50">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
