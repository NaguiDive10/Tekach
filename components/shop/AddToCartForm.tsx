"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useTracking } from "@/hooks/useTracking";
import type { Product } from "@/lib/types";
import { unitPriceForVariant } from "@/lib/pricing";

export function AddToCartForm({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const { addLine } = useCart();
  const { track } = useTracking();
  const v = product.variants.find((x) => x.id === variantId);
  const unit = v ? unitPriceForVariant(product, variantId) : product.basePrice;

  return (
    <div className="mt-8 space-y-6">
      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-stone-500">
          Variante
        </label>
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-400"
        >
          {product.variants.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}
              {x.priceDelta ? ` (+${x.priceDelta} €)` : ""}
            </option>
          ))}
        </select>
      </div>
      <p className="text-2xl font-light tracking-tight text-stone-900">
        {unit.toFixed(2)} €
      </p>
      <button
        type="button"
        onClick={async () => {
          if (!v) return;
          addLine({
            productId: product.id,
            variantId: v.id,
            quantity: 1,
            title: `${product.name} — ${v.label}`,
            unitPrice: unit,
          });
          await track("add_to_cart", {
            productId: product.id,
            variantId: v.id,
          });
        }}
        className="w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
      >
        Ajouter au panier
      </button>
    </div>
  );
}
