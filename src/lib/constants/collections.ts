export const collections = [
  { slug: "premium-collection", name: "Premium Collection" },
  { slug: "best-sellers", name: "Best Sellers" },
  { slug: "new-arrivals", name: "New Arrivals" },
] as const;

export type CollectionSlug = (typeof collections)[number]["slug"];
