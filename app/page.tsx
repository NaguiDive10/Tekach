import Link from "next/link";
import { fetchCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/ProductCard";

export default async function HomePage() {
  const { products } = await fetchCatalog();
  const featured = products.slice(0, 3);

  return (
    <div className="space-y-16">
      <section className="pt-6">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500">
          Agent e-commerce omnicanal
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light tracking-tight text-stone-900 sm:text-5xl">
          Tracking précis. Relance email. Appel vocal IA.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-stone-600">
          Tekach combine une vitrine haut de gamme, un tunnel d’achat mesurable et
          un agent qui négocie dans des limites strictes pour récupérer vos
          paniers abandonnés.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-stone-900 px-6 py-3 text-sm text-white transition hover:bg-stone-800"
          >
            Découvrir la boutique
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-stone-300 px-6 py-3 text-sm text-stone-800 transition hover:border-stone-400"
          >
            Tableau de bord marchand
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-lg font-medium text-stone-900">Sélection</h2>
          <Link href="/shop" className="text-xs text-stone-500 hover:text-stone-800">
            Tout voir
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
