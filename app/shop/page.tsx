import Link from "next/link";
import { fetchCatalog } from "@/lib/catalog";

export default async function ShopIndexPage() {
  const { categories } = await fetchCatalog();
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight text-stone-900">
        Boutique
      </h1>
      <p className="mt-2 max-w-lg text-sm text-stone-600">
        Parcourez les univers Tekach : chaque catégorie regroupe des fiches
        détaillées avec variantes.
      </p>
      <ul className="mt-10 space-y-3">
        {sorted.map((c) => (
          <li key={c.id}>
            <Link
              href={`/shop/${c.slug}`}
              className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-6 py-5 text-sm transition hover:border-stone-300"
            >
              <span className="font-medium text-stone-900">{c.name}</span>
              <span className="text-stone-400">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
