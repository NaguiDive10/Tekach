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
      <h1 className="mt-2 text-2xl font-light text-stone-900">{cat.name}</h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
