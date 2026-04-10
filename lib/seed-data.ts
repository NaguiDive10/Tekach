import type { Category, Product } from "@/lib/types";

export const SEED_CATEGORIES: Category[] = [
  { id: "cat-tech", name: "Tech", slug: "tech", order: 0 },
  { id: "cat-mode", name: "Mode", slug: "mode", order: 1 },
  { id: "cat-maison", name: "Maison", slug: "maison", order: 2 },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-setup-pro",
    name: "Setup Pro",
    slug: "setup-pro",
    categoryId: "cat-tech",
    description:
      "Station de travail complète : écran calibration, hub Thunderbolt, clavier mécanique. Pensé pour les créateurs exigeants.",
    basePrice: 1200,
    images: ["/placeholder-product.svg"],
    variants: [
      {
        id: "v-graphite",
        label: "Graphite",
        sku: "SP-GR",
        priceDelta: 0,
        stock: 12,
      },
      {
        id: "v-silver",
        label: "Silver",
        sku: "SP-SV",
        priceDelta: 0,
        stock: 8,
      },
    ],
  },
  {
    id: "prod-lumina-lamp",
    name: "Lumina Lamp",
    slug: "lumina-lamp",
    categoryId: "cat-maison",
    description:
      "Lampe à variation de température de couleur, aluminium brossé. Design minimaliste.",
    basePrice: 189,
    images: ["/placeholder-product.svg"],
    variants: [
      { id: "v-mat", label: "Noir mat", sku: "LL-BK", priceDelta: 0, stock: 40 },
      {
        id: "v-brass",
        label: "Laiton",
        sku: "LL-BR",
        priceDelta: 35,
        stock: 15,
      },
    ],
  },
  {
    id: "prod-weave-jacket",
    name: "Veste Weave",
    slug: "weave-jacket",
    categoryId: "cat-mode",
    description:
      "Coupe ample, laine mérinos et finitions intérieures techniques. Fabriqué en Europe.",
    basePrice: 420,
    images: ["/placeholder-product.svg"],
    variants: [
      { id: "v-s", label: "S", sku: "WJ-S", priceDelta: 0, stock: 6 },
      { id: "v-m", label: "M", sku: "WJ-M", priceDelta: 0, stock: 10 },
      { id: "v-l", label: "L", sku: "WJ-L", priceDelta: 0, stock: 7 },
    ],
  },
];
