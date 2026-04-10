import Link from "next/link";
import { fetchCatalog } from "@/lib/catalog";

/** Page d’accueil = vitrine boutique (catalogue par univers). */
export default async function HomePage() {
  const { categories, products } = await fetchCatalog();
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-xl bg-[#232f3e] text-white shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative px-6 py-14 sm:px-10 sm:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#febd69]">
            Boutique Tekach
          </p>
          <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
            Tout pour équiper votre quotidien
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/90">
            Tech, mode et maison : des fiches détaillées, plusieurs photos par
            article et variantes en stock. Parcourez par univers ci-dessous.
          </p>
          <p className="mt-4 text-xs text-white/70">
            Plateforme SDK &amp; IA :{" "}
            <Link href="/tekach-ia" className="text-[#febd69] underline">
              Tekach IA
            </Link>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#0f1111]">Univers</h2>
        <p className="mt-1 text-sm text-stone-600">
          {products.length} articles répartis en {sorted.length} catégories.
        </p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((c) => {
            const count = products.filter((p) => p.categoryId === c.id).length;
            const cover =
              c.image ??
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80";
            return (
              <li key={c.id}>
                <Link
                  href={`/shop/${c.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:border-[#febd69]/70 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded bg-white/95 px-2 py-0.5 text-xs font-medium text-[#0f1111]">
                      {count} article{count > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-lg font-semibold text-[#0f1111]">
                      {c.name}
                    </span>
                    {c.description ? (
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                        {c.description}
                      </p>
                    ) : null}
                    <span className="mt-4 text-sm font-medium text-[#c45500]">
                      Voir la sélection →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
