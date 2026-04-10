import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const from = product.basePrice;
  const img = product.images[0] ?? "/placeholder-product.svg";
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition hover:border-stone-300 hover:shadow-md"
    >
      <div className="aspect-[4/3] bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt=""
          className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
        />
      </div>
      <div className="p-5">
        <h3 className="text-sm font-medium tracking-wide text-stone-900">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-500">
          {product.description}
        </p>
        <p className="mt-4 text-xs text-stone-400">À partir de {from} €</p>
      </div>
    </Link>
  );
}
