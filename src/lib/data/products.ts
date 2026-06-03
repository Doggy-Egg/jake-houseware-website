import type { CollectionSlug } from "@/lib/constants/collections";
import type { Product } from "@/types/product";

function img(slug: string, index = 0) {
  return `https://picsum.photos/seed/jake-${slug}-${index}/800/800`;
}

type SeedInput = Omit<
  Product,
  "images" | "thumbnail" | "createdAt" | "updatedAt" | "status"
> & {
  imageCount?: number;
  status?: Product["status"];
};

function p(data: SeedInput): Product {
  const { imageCount = 1, ...rest } = data;
  const images = Array.from({ length: imageCount }, (_, i) => img(rest.slug, i));

  return {
    ...rest,
    status: rest.status ?? "active",
    images,
    thumbnail: images[0],
    createdAt: "2025-01-15T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  };
}

function withCollections(collectionSlugs: CollectionSlug[]) {
  return { collectionSlugs };
}

export const products: Product[] = [
  p({
    id: "1",
    slug: "stainless-steel-wine-pourer",
    itemNo: "JH-WA-001",
    name: "Stainless Steel Wine Pourer",
    description:
      "Precision-engineered wine pourer with drip-free spout. Brushed stainless steel finish suitable for retail gift packaging. Ideal for wine accessory sets and promotional programs.",
    categorySlug: "wine-accessories",
    subCategorySlug: "other-wine-accessories",
    ...withCollections(["best-sellers", "premium-collection"]),
    moq: 500,
    material: "304 Stainless Steel",
    dimensions: "12 × 3 cm",
    packaging: "Individual poly bag / retail box optional",
    leadTime: "25–30 days",
    keywords: ["wine pourer", "barware", "stainless steel"],
    imageCount: 3,
  }),
  p({
    id: "2",
    slug: "vacuum-wine-stopper-set",
    itemNo: "JH-WA-002",
    name: "Vacuum Wine Stopper Set",
    description:
      "Two-piece vacuum wine preservation set with pump and stoppers. Extends wine freshness up to 7 days. Compact retail box packaging available.",
    categorySlug: "wine-accessories",
    subCategorySlug: "wine-stoppers",
    ...withCollections(["best-sellers"]),
    moq: 300,
    material: "ABS + Silicone",
    dimensions: "Box: 18 × 10 × 5 cm",
    leadTime: "20–25 days",
  }),
  p({
    id: "3",
    slug: "wine-aerator-decanter",
    itemNo: "JH-WA-003",
    name: "Wine Aerator Decanter",
    description:
      "Single-serve wine aerator with elegant curved design. Instant aeration improves bouquet and flavor profile. Gift box optional.",
    categorySlug: "wine-accessories",
    subCategorySlug: "other-wine-accessories",
    ...withCollections(["new-arrivals", "premium-collection"]),
    moq: 500,
    material: "Acrylic + Silicone",
    dimensions: "16 × 8 cm",
    leadTime: "25 days",
  }),
  p({
    id: "4",
    slug: "cocktail-shaker-set",
    itemNo: "JH-BW-001",
    name: "Professional Cocktail Shaker Set",
    description:
      "Three-piece Boston shaker set with jigger, strainer, and bar spoon. Mirror-polished stainless steel. Standard configuration for barware retail programs.",
    categorySlug: "barware",
    subCategorySlug: "cocktail-shakers",
    ...withCollections(["best-sellers", "premium-collection"]),
    packaging: "Foam-lined gift box",
    leadTime: "30 days",
    imageCount: 2,
  }),
  p({
    id: "5",
    slug: "crystal-mixing-glass",
    itemNo: "JH-BW-002",
    name: "Crystal Mixing Glass",
    description:
      "Hand-blown crystal mixing glass with weighted base. Classic Yarai pattern etching. Premium barware for upscale retail channels.",
    categorySlug: "barware",
    subCategorySlug: "mixing-glasses",
    ...withCollections(["premium-collection"]),
  }),
  p({
    id: "6",
    slug: "bar-tool-gift-set",
    itemNo: "JH-BW-003",
    name: "Bar Tool Gift Set",
    description:
      "Complete 8-piece bar tool set in bamboo stand. Includes muddler, jigger, strainer, tongs, and opener. Ready for private label packaging.",
    categorySlug: "barware",
    subCategorySlug: "bar-accessories",
    ...withCollections(["best-sellers", "new-arrivals"]),
    dimensions: "Stand: 24 × 10 × 8 cm",
    leadTime: "28 days",
  }),
  p({
    id: "7",
    slug: "whiskey-stones-set",
    itemNo: "JH-WH-001",
    name: "Whiskey Stones Gift Set",
    description:
      "Nine soapstone whiskey stones with velvet pouch and wooden box. Non-diluting chill solution for spirits. Strong seasonal gift item.",
    categorySlug: "whiskey-accessories",
    subCategorySlug: "whiskey-stones",
    ...withCollections(["best-sellers"]),
    dimensions: "Box: 12 × 12 × 4 cm",
  }),
  p({
    id: "8",
    slug: "crystal-whiskey-glass-set",
    itemNo: "JH-WH-002",
    name: "Crystal Whiskey Glass Set",
    description:
      "Set of two heavy-base crystal whiskey tumblers. Laser-cut rim with exceptional clarity. Suitable for engraving and custom branding.",
    categorySlug: "whiskey-accessories",
    subCategorySlug: "whiskey-glasses",
    ...withCollections(["premium-collection", "best-sellers"]),
    imageCount: 2,
  }),
  p({
    id: "9",
    slug: "whiskey-decanter-globe",
    itemNo: "JH-WH-003",
    name: "Whiskey Decanter Globe Set",
    description:
      "Globe-shaped decanter with four matching glasses and wooden base. Statement piece for premium gift and specialty retail.",
    categorySlug: "whiskey-accessories",
    subCategorySlug: "other-whiskey-accessories",
    ...withCollections(["premium-collection", "new-arrivals"]),
    dimensions: "Decanter: 850 ml",
    packaging: "Protective foam + color box",
  }),
  p({
    id: "10",
    slug: "manual-coffee-grinder",
    itemNo: "JH-CA-001",
    name: "Manual Coffee Grinder",
    description:
      "Ceramic burr manual grinder with adjustable coarseness. Compact design for home and travel. Available in black, white, and natural wood.",
    categorySlug: "coffee-accessories",
    subCategorySlug: "coffee-tools",
    ...withCollections(["best-sellers", "new-arrivals"]),
    moq: 300,
    material: "Stainless Steel + Ceramic Burr",
    dimensions: "18 × 5 cm",
    leadTime: "25 days",
  }),
  p({
    id: "11",
    slug: "pour-over-coffee-dripper",
    itemNo: "JH-CA-002",
    name: "Pour Over Coffee Dripper",
    description:
      "V-shaped ceramic pour over dripper with spiral ribs. Compatible with standard #02 filters. Matte glaze finish in multiple colors.",
    categorySlug: "coffee-accessories",
    subCategorySlug: "other-coffee-accessories",
    ...withCollections(["new-arrivals"]),
    moq: 500,
    material: "Ceramic",
    dimensions: "12 × 10 cm",
  }),
  p({
    id: "12",
    slug: "coffee-tamper-set",
    itemNo: "JH-CA-003",
    name: "Espresso Tamper Set",
    description:
      "Calibrated espresso tamper with spring-loaded base and stand. 58 mm flat base for commercial portafilters. Barista-grade construction.",
    categorySlug: "coffee-accessories",
    subCategorySlug: "coffee-tools",
    ...withCollections(["premium-collection"]),
    dimensions: "58 mm base diameter",
  }),
  p({
    id: "13",
    slug: "garlic-press-pro",
    itemNo: "JH-KG-001",
    name: "Heavy-Duty Garlic Press",
    description:
      "Ergonomic garlic press with soft-grip handles and easy-clean chamber. Zinc alloy construction for durability. Dishwasher safe.",
    categorySlug: "kitchen-gadgets",
    subCategorySlug: "other-kitchen-gadgets",
    ...withCollections(["best-sellers"]),
    moq: 1000,
    material: "Zinc Alloy",
    dimensions: "18 × 5 × 4 cm",
  }),
  p({
    id: "14",
    slug: "adjustable-mandoline-slicer",
    itemNo: "JH-KG-002",
    name: "Adjustable Mandoline Slicer",
    description:
      "Stainless steel mandoline with five thickness settings and safety guard. Non-slip base for stable countertop use. Retail hang-tag packaging.",
    categorySlug: "kitchen-gadgets",
    subCategorySlug: "other-kitchen-gadgets",
    ...withCollections(["new-arrivals"]),
    moq: 500,
    material: "Stainless Steel + ABS",
    dimensions: "35 × 12 × 5 cm",
  }),
  p({
    id: "15",
    slug: "silicone-kitchen-utensil-set",
    itemNo: "JH-KG-003",
    name: "Silicone Kitchen Utensil Set",
    description:
      "Twelve-piece heat-resistant silicone utensil set with acacia wood handles and rotating stand. BPA-free, up to 230°C. Strong Amazon and retail performer.",
    categorySlug: "kitchen-gadgets",
    subCategorySlug: "other-kitchen-gadgets",
    ...withCollections(["best-sellers"]),
    moq: 300,
    material: "Silicone + Acacia Wood",
    dimensions: "Stand: 12 cm diameter",
  }),
  p({
    id: "16",
    slug: "marble-coaster-set",
    itemNo: "JH-LA-001",
    name: "Marble Coaster Set",
    description:
      "Set of four natural marble coasters with cork backing and gift box. Each piece unique in veining pattern. Popular lifestyle gift item.",
    categorySlug: "lifestyle-accessories",
    ...withCollections(["premium-collection"]),
    moq: 500,
    material: "Natural Marble + Cork",
    dimensions: "10 × 10 cm each",
  }),
  p({
    id: "17",
    slug: "leather-desk-organizer",
    itemNo: "JH-LA-002",
    name: "Leather Desk Organizer",
    description:
      "Multi-compartment desk organizer in PU leather with contrast stitching. Holds pens, cards, and phone. Executive gift category.",
    categorySlug: "lifestyle-accessories",
    ...withCollections(["premium-collection", "new-arrivals"]),
    moq: 300,
    material: "PU Leather",
    dimensions: "25 × 15 × 8 cm",
  }),
  p({
    id: "18",
    slug: "acacia-serving-board",
    itemNo: "JH-LA-003",
    name: "Acacia Wood Serving Board",
    description:
      "Live-edge acacia serving board with juice groove and handle cutout. Food-safe mineral oil finish. Ideal for charcuterie retail displays.",
    categorySlug: "lifestyle-accessories",
    ...withCollections(["best-sellers"]),
    moq: 200,
    material: "Acacia Wood",
    dimensions: "45 × 25 × 2 cm",
  }),
  p({
    id: "19",
    slug: "wine-accessory-gift-set",
    itemNo: "JH-ST-001",
    name: "Wine Accessory Gift Set",
    description:
      "Five-piece wine set including opener, stopper, pourer, ring, and foil cutter in bamboo box. Complete retail-ready gift solution.",
    categorySlug: "sets",
    subCategorySlug: "wine-sets",
    ...withCollections(["best-sellers", "premium-collection"]),
  }),
  p({
    id: "20",
    slug: "barware-starter-set",
    itemNo: "JH-ST-002",
    name: "Barware Starter Set",
    description:
      "Entry-level barware bundle with shaker, jigger, strainer, and muddler in branded box. Designed for retail promotional pricing tiers.",
    categorySlug: "sets",
    subCategorySlug: "bartender-sets",
    ...withCollections(["new-arrivals"]),
  }),
  p({
    id: "21",
    slug: "coffee-lovers-gift-set",
    itemNo: "JH-ST-003",
    name: "Coffee Lovers Gift Set",
    description:
      "Curated coffee gift set with manual grinder, dripper, and scoop in kraft gift box. Seasonal and corporate gifting program ready.",
    categorySlug: "sets",
    subCategorySlug: "coffee-sets",
    ...withCollections(["new-arrivals", "premium-collection"]),
    dimensions: "Box: 28 × 20 × 10 cm",
  }),
];

export function getCollectionName(slug: CollectionSlug): string {
  const names: Record<CollectionSlug, string> = {
    "premium-collection": "Premium Collection",
    "best-sellers": "Best Sellers",
    "new-arrivals": "New Arrivals",
  };
  return names[slug];
}
