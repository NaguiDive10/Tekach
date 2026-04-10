import type { Product } from "@/lib/types";

export function unitPriceForVariant(
  product: Product,
  variantId: string,
): number {
  const v = product.variants.find((x) => x.id === variantId);
  if (!v) return product.basePrice;
  return product.basePrice + v.priceDelta;
}
