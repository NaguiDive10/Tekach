import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const from = product.basePrice;
  const img = product.images[0] ?? "/placeholder-product.svg";
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:border-[#febd69]/80 hover:shadow-md"
    >
      <div className="aspect-square bg-stone-100 sm:aspect-[4/3]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-sm font-semibold leading-snug text-[#0f1111]">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-stone-600">
          {product.description}
        </p>
        <p className="mt-4 text-sm font-medium text-[#b12704]">
          À partir de {from} €
        </p>
      </div>
    </Link>
  );
}
