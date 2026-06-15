"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminProducts } from "@/context/admin/admin-products-context";
import type { ProductInput } from "@/lib/data/product-store";
import { adminCopy, collectionAdminLabels } from "@/lib/constants/admin";
import { collections } from "@/lib/constants/collections";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";
import { formatCollectionAdminLabels } from "@/lib/utils/admin-labels";
import { normalizeItemNoKey, resolveProductSlug } from "@/lib/utils/slug";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { CollectionSlug } from "@/lib/constants/collections";
import type { Product, ProductStatus } from "@/types/product";

type TaxonomyCategory = { slug: string; name: string };
type TaxonomySubCategory = { slug: string; name: string; categorySlug: string };

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: FormState;
};

export type FormState = {
  name: string;
  itemNo: string;
  description: string;
  categorySlug: ProductCategorySlug;
  subCategorySlug: ProductSubCategorySlug | "";
  collectionSlugs: CollectionSlug[];
  images: string;
  thumbnail: string;
  material: string;
  dimensions: string;
  moq: string;
  packaging: string;
  leadTime: string;
  keywords: string;
  weight: string;
  cartonSize: string;
  qtyPerCarton: string;
  cbm: string;
  factory: string;
  status: ProductStatus;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const defaultForm: FormState = {
  name: "",
  itemNo: "",
  description: "",
  categorySlug: "barware",
  subCategorySlug: "",
  collectionSlugs: [],
  images: "",
  thumbnail: "",
  material: "",
  dimensions: "",
  moq: "",
  packaging: "",
  leadTime: "",
  keywords: "",
  weight: "",
  cartonSize: "",
  qtyPerCarton: "",
  cbm: "",
  factory: "",
  status: "draft",
};

export function productToFormState(product: Product): FormState {
  return {
    name: product.name,
    itemNo: product.itemNo,
    description: product.description ?? "",
    categorySlug: product.categorySlug,
    subCategorySlug: product.subCategorySlug ?? "",
    collectionSlugs: product.collectionSlugs,
    images: product.images.join("\n"),
    thumbnail: product.thumbnail ?? "",
    material: product.material ?? "",
    dimensions: product.dimensions ?? "",
    moq: product.moq != null ? String(product.moq) : "",
    packaging: product.packaging ?? "",
    leadTime: product.leadTime ?? "",
    keywords: product.keywords?.join(", ") ?? "",
    weight: product.weight ?? "",
    cartonSize: product.cartonSize ?? "",
    qtyPerCarton:
      product.qtyPerCarton != null ? String(product.qtyPerCarton) : "",
    cbm: product.cbm != null ? String(product.cbm) : "",
    factory: product.factory ?? "",
    status: product.status,
  };
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toFormInput(form: FormState): ProductInput {
  const images = form.images
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    name: form.name,
    itemNo: form.itemNo.trim(),
    description: form.description || undefined,
    categorySlug: form.categorySlug,
    subCategorySlug: form.subCategorySlug || undefined,
    collectionSlugs: form.collectionSlugs,
    images,
    thumbnail: form.thumbnail || images[0] || undefined,
    material: form.material || undefined,
    dimensions: form.dimensions || undefined,
    moq: parseOptionalNumber(form.moq),
    packaging: form.packaging || undefined,
    leadTime: form.leadTime || undefined,
    keywords: form.keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    weight: form.weight || undefined,
    cartonSize: form.cartonSize || undefined,
    qtyPerCarton: parseOptionalNumber(form.qtyPerCarton),
    cbm: parseOptionalNumber(form.cbm),
    factory: form.factory || undefined,
    status: form.status,
  };
}

function validateForm(
  form: FormState,
  products: Product[],
  productId?: string,
): FormErrors {
  const errors: FormErrors = {};

  if (!form.itemNo.trim()) {
    errors.itemNo = "请填写 Item No.";
  } else if (
    products.some(
      (product) =>
        product.id !== productId &&
        normalizeItemNoKey(product.itemNo) === normalizeItemNoKey(form.itemNo),
    )
  ) {
    errors.itemNo = "该 Item No. 已被其他产品使用";
  }
  if (form.moq.trim() && Number(form.moq) < 1) {
    errors.moq = "MOQ 至少为 1";
  }
  if (form.qtyPerCarton.trim() && Number(form.qtyPerCarton) < 1) {
    errors.qtyPerCarton = "每箱数量至少为 1";
  }
  if (form.cbm.trim() && Number(form.cbm) <= 0) {
    errors.cbm = "CBM 必须大于 0";
  }

  return errors;
}

export function ProductForm({
  mode,
  productId,
  initialValues,
}: ProductFormProps) {
  const router = useRouter();
  const { createProduct, updateProduct, products } = useAdminProducts();
  const [form, setForm] = useState<FormState>(initialValues ?? defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [subCategories, setSubCategories] = useState<TaxonomySubCategory[]>([]);

  useEffect(() => {
    void fetch("/api/taxonomy")
      .then((response) => response.json())
      .then(
        (data: {
          categories: TaxonomyCategory[];
          subCategories: TaxonomySubCategory[];
        }) => {
          setCategories(data.categories);
          setSubCategories(data.subCategories);
        },
      );
  }, []);

  const visibleSubCategories = subCategories.filter(
    (subCategory) => subCategory.categorySlug === form.categorySlug,
  );

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "categorySlug") {
        const category = value as ProductCategorySlug;
        if (
          next.subCategorySlug &&
          !subCategories.some(
            (subCategory) =>
              subCategory.slug === next.subCategorySlug &&
              subCategory.categorySlug === category,
          )
        ) {
          next.subCategorySlug = "";
        }
      }
      return next;
    });
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const toggleCollection = (slug: CollectionSlug) => {
    setForm((current) => ({
      ...current,
      collectionSlugs: current.collectionSlugs.includes(slug)
        ? current.collectionSlugs.filter((item) => item !== slug)
        : [...current.collectionSlugs, slug],
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validateForm(form, products, productId);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const input = toFormInput(form);
    setSaving(true);

    try {
      if (mode === "create") {
        await createProduct(input);
      } else if (productId) {
        await updateProduct(productId, input);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "保存失败，请重试",
      );
    } finally {
      setSaving(false);
    }
  };

  const collectionStatus =
    form.collectionSlugs.length === 0
      ? adminCopy.regularProduct
      : formatCollectionAdminLabels(form.collectionSlugs);

  const productUrlSlug = form.itemNo.trim()
    ? resolveProductSlug({ itemNo: form.itemNo })
    : null;

  const primaryPreview =
    form.thumbnail.trim() ||
    form.images
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean);

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      <FormSection
        title="Public · 客户可见"
        description="填写后才会在前台网站展示。未填写的字段不会显示给客户。"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label={`产品名称 (${adminCopy.optional})`}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            error={errors.name}
            placeholder="留空则前台显示 Item No."
          />
        <Input
          label="Item No."
          value={form.itemNo}
          onChange={(event) => updateField("itemNo", event.target.value)}
          error={errors.itemNo}
          placeholder="JH-BW-001"
          required
        />
        <p className="-mt-3 text-xs text-muted lg:col-span-2">
          Item No. 全局唯一，并自动作为产品 URL（例如 /products/jh-bw-001）。
        </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Category
            </label>
            <select
              id="category"
              value={form.categorySlug}
              onChange={(event) =>
                updateField(
                  "categorySlug",
                  event.target.value as ProductCategorySlug,
                )
              }
              className="h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="subCategory"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Sub-category ({adminCopy.optional})
            </label>
            <select
              id="subCategory"
              value={form.subCategorySlug}
              onChange={(event) =>
                updateField(
                  "subCategorySlug",
                  event.target.value as ProductSubCategorySlug | "",
                )
              }
              className="h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">None</option>
              {visibleSubCategories.map((subCategory) => (
                <option key={subCategory.slug} value={subCategory.slug}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Textarea
          label="产品描述（选填）"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
        />

        <div className="grid gap-5 lg:grid-cols-3">
          <Input
            label="MOQ（选填）"
            type="number"
            min={1}
            value={form.moq}
            onChange={(event) => updateField("moq", event.target.value)}
            error={errors.moq}
          />
          <Input
            label="材质（选填）"
            value={form.material}
            onChange={(event) => updateField("material", event.target.value)}
          />
          <Input
            label="尺寸（选填）"
            value={form.dimensions}
            onChange={(event) => updateField("dimensions", event.target.value)}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="包装（选填）"
            value={form.packaging}
            onChange={(event) => updateField("packaging", event.target.value)}
          />
          <Input
            label="交期（选填）"
            value={form.leadTime}
            onChange={(event) => updateField("leadTime", event.target.value)}
            placeholder="25–30 days"
          />
        </div>

        <Input
          label="关键词（选填，逗号分隔）"
          value={form.keywords}
          onChange={(event) => updateField("keywords", event.target.value)}
          placeholder="wine pourer, barware, stainless steel"
        />

        <div className="rounded-sm border border-border bg-muted-bg p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Collections（{adminCopy.optional}）
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                通过 collectionSlugs 管理系列归属，例如 best-sellers、new-arrivals、
                premium-collection。不勾选 = 普通商品，仅按分类展示。
              </p>
            </div>
            <span className="shrink-0 rounded-sm border border-border bg-surface px-3 py-1.5 text-xs text-muted">
              当前：{collectionStatus}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {collections.map((collection) => (
              <label
                key={collection.slug}
                className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form.collectionSlugs.includes(collection.slug)}
                  onChange={() => toggleCollection(collection.slug)}
                  className="accent-accent"
                />
                {collectionAdminLabels[collection.slug] ?? collection.name}
              </label>
            ))}
          </div>
        </div>

        <Input
          label="Primary Image URL（主图 1:1，选填，默认第一张场景图）"
          value={form.thumbnail}
          onChange={(event) => updateField("thumbnail", event.target.value)}
        />
        {primaryPreview ? (
          <div className="w-32 overflow-hidden rounded-sm border border-border bg-muted-bg">
            <div className="aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryPreview}
                alt="Primary image preview"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <ImageUploadField
          value={form.images}
          onChange={(images) => updateField("images", images)}
        />
      </FormSection>

      <FormSection
        title="Internal · 内部产品数据库"
        description="仅 Admin 可见，不会展示给网站访客。用于公司内部了解产品规格与供应链信息。"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <Input
            label="重量（选填）"
            value={form.weight}
            onChange={(event) => updateField("weight", event.target.value)}
            placeholder="e.g. 180g / pc"
          />
          <Input
            label="外箱尺寸（选填）"
            value={form.cartonSize}
            onChange={(event) => updateField("cartonSize", event.target.value)}
            placeholder="e.g. 50 × 40 × 35 cm"
          />
          <Input
            label="每箱数量（选填）"
            type="number"
            min={1}
            value={form.qtyPerCarton}
            onChange={(event) =>
              updateField("qtyPerCarton", event.target.value)
            }
            error={errors.qtyPerCarton}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="CBM（选填）"
            type="number"
            min={0}
            step="0.001"
            value={form.cbm}
            onChange={(event) => updateField("cbm", event.target.value)}
            error={errors.cbm}
          />
          <Input
            label="工厂（选填）"
            value={form.factory}
            onChange={(event) => updateField("factory", event.target.value)}
          />
        </div>
      </FormSection>

      <FormSection
        title="System · 网站管理"
        description="控制产品在前台的发布状态。"
      >
        {productUrlSlug ? (
          <p className="text-sm text-muted">
            产品 URL：{" "}
            <code className="rounded bg-muted-bg px-1.5 py-0.5 text-foreground">
              /products/{productUrlSlug}
            </code>
          </p>
        ) : null}
        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            发布状态
          </label>
          <select
            id="status"
            value={form.status}
            onChange={(event) =>
              updateField("status", event.target.value as ProductStatus)
            }
            className="h-11 w-full max-w-md rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="draft">草稿 — 前台不可见</option>
            <option value="active">已发布 — 前台可见</option>
            <option value="inactive">已下架 — 前台不可见</option>
          </select>
        </div>
      </FormSection>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        {submitError ? (
          <p className="w-full text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}
        <Button type="submit" disabled={saving}>
          {saving
            ? "保存中..."
            : mode === "create"
              ? "创建产品"
              : "保存修改"}
        </Button>
        <Button href="/admin/products" variant="outline" type="button">
          取消
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-sm border border-border bg-surface p-5 md:p-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
