import Link from "next/link";
import { fetchCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/ProductCard";

/** Boutique de référence — intègre le SDK Tekach via l’app Next (hook `useTracking`). */
export default async function DemoStorePage() {
  const { products, categories } = await fetchCatalog();
  const featured = products.slice(0, 6);
  const cats = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-14 md:space-y-20">
      <p className="text-xs text-stone-500">
        <Link href="/tekach-ia" className="text-[#c45500] hover:underline">
          ← Tekach IA (SDK)
        </Link>
      </p>

      <section className="relative -mx-3 overflow-hidden rounded-xl sm:mx-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="max-h-[min(420px,55vh)] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#131921]/90 via-[#131921]/55 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 py-12 sm:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#febd69]">
            Boutique de démonstration
          </p>
          <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Parcours e-commerce complet (tracking Tekach actif)
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/90">
            Catalogue, panier, checkout : les événements sont ingérés via le SDK
            (même logique que le script <code className="text-white/80">sdk/v1.js</code>
            ).
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-md bg-[#febd69] px-6 py-3 text-sm font-semibold text-[#131921] shadow-md transition hover:bg-[#f3a847]"
            >
              Entrer en boutique
            </Link>
            <Link
              href="/admin/dashboard/install"
              className="rounded-md border border-white/40 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              Snippet SDK (Admin)
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#0f1111]">Par univers</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {cats.map((c) => {
            const cover =
              c.image ??
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80";
            return (
              <Link
                key={c.id}
                href={`/shop/${c.slug}`}
                className="group relative overflow-hidden rounded-xl border border-stone-200 shadow-sm transition hover:border-[#febd69]/60"
              >
                <div className="aspect-[5/3] overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="bg-white px-4 py-3">
                  <p className="font-semibold text-[#0f1111]">{c.name}</p>
                  {c.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-stone-600">
                      {c.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0f1111]">
              Coups de cœur
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Sélection issue du catalogue démo.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-[#c45500] hover:underline"
          >
            Tout le catalogue →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
