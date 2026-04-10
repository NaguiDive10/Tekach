import type { Category, Product } from "@/lib/types";

const u = (path: string, w = 900) =>
  `https://images.unsplash.com/${path}?auto=format&fit=crop&w=${w}&q=80`;

export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-courses",
    name: "Courses alimentaires",
    slug: "courses-alimentaires",
    order: 0,
    image: u("photo-1542838132-92c53300491e", 1400),
    description:
      "Épicerie, frais et boissons — sélection en cours d’élargissement.",
  },
  {
    id: "cat-top",
    name: "Meilleures ventes",
    slug: "meilleures-ventes",
    order: 1,
    image: u("photo-1607082349566-187342175e2f", 1400),
    description: "Les articles les plus appréciés par nos clients.",
  },
  {
    id: "cat-flash",
    name: "Ventes Flash",
    slug: "ventes-flash",
    order: 2,
    image: u("photo-1607082348824-0a96f2a4b9da", 1400),
    description: "Offres limitées dans le temps — stock sous réserve.",
  },
  {
    id: "cat-nouv",
    name: "Dernières Nouveautés",
    slug: "nouveautes",
    order: 3,
    image: u("photo-1441986300917-64674bd600d8", 1400),
    description: "Nouveautés ajoutées récemment au catalogue.",
  },
  {
    id: "cat-basics",
    name: "Amazon Basics",
    slug: "amazon-basics",
    order: 4,
    image: u("photo-1558618666-fcd25c85cd64", 1400),
    description:
      "Essentiels au bon rapport qualité-prix — gamme type Amazon Basics.",
  },
  {
    id: "cat-livres",
    name: "Livres",
    slug: "livres",
    order: 5,
    image: u("photo-1512820790803-83ca734da794", 1400),
    description: "Romans, essais et guides — rayon en construction.",
  },
  {
    id: "cat-cadeaux",
    name: "Cartes cadeaux",
    slug: "cartes-cadeaux",
    order: 6,
    image: u("photo-1513885535751-8b9238bd345a", 1400),
    description: "Cartes et bons cadeaux numériques ou physiques.",
  },
  {
    id: "cat-maison",
    name: "Cuisine et maison",
    slug: "cuisine-et-maison",
    order: 7,
    image: u("photo-1586023492125-27b2c045efd7", 1400),
    description:
      "Luminaires, mobilier, cuisine et décoration pour toute la maison.",
  },
  {
    id: "cat-tech",
    name: "High-Tech",
    slug: "high-tech",
    order: 8,
    image: u("photo-1517694712202-14dd9538aa97", 1400),
    description:
      "Informatique, audio, écrans et accessoires — équivalent rayon High-Tech.",
  },
  {
    id: "cat-jeux-jouets",
    name: "Jeux et Jouets",
    slug: "jeux-jouets",
    order: 9,
    image: u("photo-1558060370-d644479cb6f7", 1400),
    description: "Jeux de société, jouets et loisirs créatifs.",
  },
  {
    id: "cat-jeux-video",
    name: "Jeux vidéo",
    slug: "jeux-video",
    order: 10,
    image: u("photo-1493711662062-fa541f7f3d24", 1400),
    description: "Consoles, jeux et accessoires gaming.",
  },
  {
    id: "cat-bebe",
    name: "Bébé",
    slug: "bebe",
    order: 11,
    image: u("photo-1515488042361-ee00e0ddd4e4", 1400),
    description: "Puériculture, alimentation et soins pour bébé.",
  },
  {
    id: "cat-mode",
    name: "Mode",
    slug: "mode",
    order: 12,
    image: u("photo-1445205170230-053b83016050", 1400),
    description: "Vêtements, chaussures et accessoires.",
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-setup-pro",
    name: "Setup Pro",
    slug: "setup-pro",
    categoryId: "cat-tech",
    description:
      "Station complète : écran calibration, hub Thunderbolt, clavier mécanique — pensée pour les créateurs exigeants et le télétravail premium.",
    basePrice: 1200,
    images: [
      u("photo-1527864670295-d9954a7a4423"),
      u("photo-1593640408182-31c70c8268f5"),
    ],
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
    id: "prod-nanobook-air",
    name: "NanoBook Air 14″",
    slug: "nanobook-air",
    categoryId: "cat-tech",
    description:
      "Ultraportable silencieux, dalle anti-reflet, autonomie journée entière. Idéal bureautique et création légère.",
    basePrice: 1099,
    images: [
      u("photo-1496181133206-80ce9b88a853"),
      u("photo-1525547719571-a2d4ac8945e2"),
    ],
    variants: [
      { id: "nb-256", label: "256 Go", sku: "NBA-256", priceDelta: 0, stock: 20 },
      { id: "nb-512", label: "512 Go", sku: "NBA-512", priceDelta: 120, stock: 14 },
    ],
  },
  {
    id: "prod-pulse-one",
    name: "Pulse One ANC",
    slug: "pulse-one",
    categoryId: "cat-tech",
    description:
      "Casque circum-aural à réduction de bruit adaptive, son spatial et confort longue durée.",
    basePrice: 279,
    images: [
      u("photo-1505740420928-5e560c06d30e"),
      u("photo-1484704849700-f032a568e944"),
    ],
    variants: [
      { id: "p-mid", label: "Minuit", sku: "PO-MN", priceDelta: 0, stock: 30 },
      { id: "p-snd", label: "Sable", sku: "PO-SD", priceDelta: 0, stock: 22 },
    ],
  },
  {
    id: "prod-vision-34",
    name: "Vision Curve 34″",
    slug: "vision-34",
    categoryId: "cat-tech",
    description:
      "Écran ultra-large QHD+, calibration usine (ΔE inférieur à 2), pied réglable — pour photo et montage.",
    basePrice: 649,
    images: [
      u("photo-1527448224954-b499cc7c52b0"),
      u("photo-1587831990711-23ca64414471"),
    ],
    variants: [
      { id: "vc-std", label: "Standard", sku: "VC34-S", priceDelta: 0, stock: 9 },
      {
        id: "vc-pro",
        label: "Pied ergonomique",
        sku: "VC34-P",
        priceDelta: 89,
        stock: 5,
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
    images: [
      u("photo-1591047138809-6b8fc6c844e4"),
      u("photo-1539533018447-63fcce2678e3"),
    ],
    variants: [
      { id: "v-s", label: "S", sku: "WJ-S", priceDelta: 0, stock: 6 },
      { id: "v-m", label: "M", sku: "WJ-M", priceDelta: 0, stock: 10 },
      { id: "v-l", label: "L", sku: "WJ-L", priceDelta: 0, stock: 7 },
    ],
  },
  {
    id: "prod-sneaker-flow",
    name: "Sneaker Flow",
    slug: "sneaker-flow",
    categoryId: "cat-mode",
    description:
      "Semelle amortissante, empeigne technique respirante. Du studio au week-end.",
    basePrice: 159,
    images: [
      u("photo-1542291026-7eec264c27ff"),
      u("photo-1608231387042-66d1773070a5"),
    ],
    variants: [
      { id: "sf-40", label: "40", sku: "SF-40", priceDelta: 0, stock: 8 },
      { id: "sf-42", label: "42", sku: "SF-42", priceDelta: 0, stock: 12 },
      { id: "sf-44", label: "44", sku: "SF-44", priceDelta: 0, stock: 10 },
    ],
  },
  {
    id: "prod-sac-linea",
    name: "Sac Linea cuir",
    slug: "sac-linea",
    categoryId: "cat-mode",
    description:
      "Cuir pleine fleur, bandoulière ajustable, compartiment laptop 13″. Fabriqué à la main.",
    basePrice: 289,
    images: [
      u("photo-1548037328-1e3b6764d8de"),
      u("photo-1590874103328-eac38a683ce7"),
    ],
    variants: [
      { id: "sl-cog", label: "Cognac", sku: "SL-CG", priceDelta: 0, stock: 11 },
      { id: "sl-obs", label: "Obsidienne", sku: "SL-OB", priceDelta: 0, stock: 9 },
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
    images: [
      u("photo-1507473885765-e6ed057f7824"),
      u("photo-1513506003901-1e6a229e2d24"),
    ],
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
    id: "prod-table-nordic",
    name: "Table basse Nordic",
    slug: "table-nordic",
    categoryId: "cat-maison",
    description:
      "Chêne massif huilé, pieds coniques. Montage rapide, finition satinée.",
    basePrice: 459,
    images: [
      u("photo-1532372320572-cda51853a881"),
      u("photo-1618220179428-2272702714e5"),
    ],
    variants: [
      { id: "tn-100", label: "100 cm", sku: "TN-100", priceDelta: 0, stock: 6 },
      { id: "tn-120", label: "120 cm", sku: "TN-120", priceDelta: 90, stock: 4 },
    ],
  },
  {
    id: "prod-bouilloire-zen",
    name: "Bouilloire Zen",
    slug: "bouilloire-zen",
    categoryId: "cat-maison",
    description:
      "Inox brossé, maintien au chaud, ouverture une main. Parfait thé et infusions.",
    basePrice: 89,
    images: [
      u("photo-1574269860823-6ec4a27e6e0a"),
      u("photo-1556911220-e15b29be8c8f"),
    ],
    variants: [
      { id: "bz-1", label: "1 L", sku: "BZ-10", priceDelta: 0, stock: 25 },
      { id: "bz-17", label: "1,7 L", sku: "BZ-17", priceDelta: 15, stock: 18 },
    ],
  },
  {
    id: "prod-plaid-alpin",
    name: "Plaid Alpin laine",
    slug: "plaid-alpin",
    categoryId: "cat-maison",
    description:
      "Mélange laine & cachemire, finition frangée. Chaleur et élégance pour le salon.",
    basePrice: 129,
    images: [
      u("photo-1616627547586-ae084aeb5c4a"),
      u("photo-1555041469-a586c61ea9bc"),
    ],
    variants: [
      { id: "pa-gr", label: "Gris brume", sku: "PA-GR", priceDelta: 0, stock: 14 },
      { id: "pa-sa", label: "Sable", sku: "PA-SA", priceDelta: 0, stock: 16 },
    ],
  },
  {
    id: "prod-horloge-atlas",
    name: "Horloge Atlas",
    slug: "horloge-atlas",
    categoryId: "cat-maison",
    description:
      "Mouvement silencieux, verre bombé, cadre métal noir mat. Diamètre 40 cm.",
    basePrice: 74,
    images: [
      u("photo-1563789036278-f4ff6bf9d686"),
      u("photo-1509048191080-d29b6837fdd6"),
    ],
    variants: [
      { id: "ha-bl", label: "Noir", sku: "HA-BK", priceDelta: 0, stock: 20 },
      { id: "ha-au", label: "Or brossé", sku: "HA-AU", priceDelta: 18, stock: 12 },
    ],
  },
];
