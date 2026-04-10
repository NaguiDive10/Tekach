import { notFound } from "next/navigation";
import { fetchCatalog, productBySlug } from "@/lib/catalog";
import { AddToCartForm } from "@/components/shop/AddToCartForm";
import { ProductViewTracker } from "@/components/shop/ProductViewTracker";
import { ProductGallery } from "@/components/shop/ProductGallery";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { products } = await fetchCatalog();
  const product = productBySlug(products, slug);
  if (!product) notFound();

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <ProductViewTracker productId={product.id} slug={product.slug} />
      <ProductGallery images={product.images} productName={product.name} />
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
          Produit
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0f1111]">
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
