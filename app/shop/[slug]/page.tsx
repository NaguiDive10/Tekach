import { notFound } from "next/navigation";
import { fetchCatalog, categoryBySlug } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const { categories, products } = await fetchCatalog();
  const cat = categoryBySlug(categories, slug);
  if (!cat) notFound();
  const list = products.filter((p) => p.categoryId === cat.id);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
        Catégorie
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[#0f1111]">{cat.name}</h1>
      {cat.description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
          {cat.description}
        </p>
      ) : null}
      {list.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-sm text-stone-500">
          Aucun produit dans cette catégorie pour le moment.
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
