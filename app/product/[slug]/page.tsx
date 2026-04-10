import { notFound } from "next/navigation";
import { fetchCatalog, productBySlug } from "@/lib/catalog";
import { AddToCartForm } from "@/components/shop/AddToCartForm";
import { ProductViewTracker } from "@/components/shop/ProductViewTracker";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { products } = await fetchCatalog();
  const product = productBySlug(products, slug);
  if (!product) notFound();
  const img = product.images[0] ?? "/placeholder-product.svg";

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <ProductViewTracker productId={product.id} slug={product.slug} />
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" className="h-full w-full object-cover" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
          Produit
        </p>
        <h1 className="mt-2 text-3xl font-light tracking-tight text-stone-900">
          {product.name}
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-stone-600">
          {product.description}
        </p>
        <AddToCartForm product={product} />
      </div>
    </div>
  );
}
