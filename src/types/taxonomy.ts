export type Category = {
  slug: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type SubCategory = {
  slug: string;
  name: string;
  categorySlug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Taxonomy = {
  categories: Category[];
  subCategories: SubCategory[];
};

export type CategoryInput = {
  name: string;
  slug?: string;
  sortOrder?: number;
};

export type SubCategoryInput = {
  name: string;
  categorySlug: string;
  slug?: string;
  sortOrder?: number;
};

export type CategoryUpdateInput = {
  name?: string;
  newSlug?: string;
  sortOrder?: number;
};

export type SubCategoryUpdateInput = {
  name?: string;
  newSlug?: string;
  categorySlug?: string;
  sortOrder?: number;
};
