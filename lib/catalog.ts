import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/lib/seed-data";
import type { Category, Product } from "@/lib/types";
import { getAdminDb } from "@/lib/firebase/admin";
import { unitPriceForVariant as unitPrice } from "@/lib/pricing";

export async function fetchCatalog(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  const db = getAdminDb();
  if (!db) {
    return {
      categories: [...SEED_CATEGORIES].sort((a, b) => a.order - b.order),
      products: SEED_PRODUCTS,
    };
  }
  const [catSnap, prodSnap] = await Promise.all([
    db.collection("categories").orderBy("order").get(),
    db.collection("products").get(),
  ]);
  const categories = catSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Category,
  );
  const products = prodSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Product,
  );
  if (categories.length === 0 || products.length === 0) {
    return {
      categories: [...SEED_CATEGORIES].sort((a, b) => a.order - b.order),
      products: SEED_PRODUCTS,
    };
  }
  return { categories, products };
}

export function productBySlug(
  products: Product[],
  slug: string,
): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function categoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export const unitPriceForVariant = unitPrice;
