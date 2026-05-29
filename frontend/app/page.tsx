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
  image?: string;
};

type Vendor = {
  id: number;
  name: string;
  description: string;
  logo?: string;
  city: string;
  country: string;
  is_active: boolean;
};

type HomePageData = {
  statistics: {
    total_products: number;
    total_vendors: number;
    total_categories: number;
  };
  featured_products: Product[];
  popular_vendors: Vendor[];
};

export default function Home() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('home/');
      setData(response.data);
    } catch (error) {
      console.error(error);
      setError('Impossible de charger la page d\'accueil. Vérifiez que le backend est démarré et accessible.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-64 rounded-3xl bg-white/50"></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-white/50"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-rose-50 border-2 border-rose-200 p-8 text-rose-800">
            <h2 className="text-2xl font-bold mb-2">Erreur</h2>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:py-20">
        
        {/* Hero Section */}
        <section className="mb-16 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Bienvenue sur AfriMarket
              </h1>
              <p className="text-lg sm:text-xl text-indigo-100 mb-6 leading-relaxed">
                La marketplace multi-vendeur pour l'Afrique. Découvrez des milliers de produits, explorez les meilleurs vendeurs et achetez en toute simplicité.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="inline-block px-8 py-3 rounded-full bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition">
                  Explorer les produits
                </Link>
                <Link href="/vendors/register" className="inline-block px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white/10 transition">
                  Devenir vendeur
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-center">
                <div className="text-3xl font-bold mb-2">{data.statistics.total_products}</div>
                <p className="text-sm text-indigo-100">Produits</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-center">
                <div className="text-3xl font-bold mb-2">{data.statistics.total_vendors}</div>
                <p className="text-sm text-indigo-100">Vendeurs</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-center">
                <div className="text-3xl font-bold mb-2">{data.statistics.total_categories}</div>
                <p className="text-sm text-indigo-100">Catégories</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Produits en vedette
              </h2>
              <p className="text-slate-600">
                Découvrez nos derniers produits populaires
              </p>
            </div>
            <Link href="/products" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
              Voir tous →
            </Link>
          </div>

          {data.featured_products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.featured_products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="block group">
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-12 text-center shadow-lg shadow-slate-200/60">
              <p className="text-xl font-semibold text-slate-900">Aucun produit disponible pour l'instant.</p>
              <p className="mt-2 text-slate-600">Ajoutez des produits depuis le backend ou revenez plus tard.</p>
            </div>
          )}
        </section>

        {/* Popular Vendors Section */}
        {data.popular_vendors.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Vendeurs populaires
                </h2>
                <p className="text-slate-600">
                  Explorez les meilleurs vendeurs d'AfriMarket
                </p>
              </div>
              <Link href="/vendors" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
                Voir tous →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.popular_vendors.map((vendor) => (
                <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group">
                  <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition h-full">
                    {vendor.logo && (
                      <img
                        src={vendor.logo}
                        alt={vendor.name}
                        className="w-16 h-16 rounded-xl object-cover mb-4"
                      />
                    )}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {vendor.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {vendor.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-4">
                      📍 {vendor.city}, {vendor.country}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de clients qui font confiance à AfriMarket pour leurs achats en ligne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="inline-block px-8 py-3 rounded-full bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition">
              Commencer le shopping
            </Link>
            <Link href="/login" className="inline-block px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white/10 transition">
              Se connecter
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
