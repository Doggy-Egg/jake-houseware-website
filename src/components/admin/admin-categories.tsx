"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCopy } from "@/lib/constants/admin";

type SubCategoryUsage = {
  slug: string;
  name: string;
  categorySlug: string;
  sortOrder: number;
  productCount: number;
};

type CategoryUsage = {
  slug: string;
  name: string;
  sortOrder: number;
  productCount: number;
  subCategories: SubCategoryUsage[];
};

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }
  return data;
}

export function AdminCategoriesContent({
  initialCategories,
}: {
  initialCategories: CategoryUsage[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubNames, setNewSubNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await parseResponse<{ categories: CategoryUsage[] }>(
        await fetch("/api/admin/taxonomy"),
      );
      setCategories(data.categories);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategoryName = async (slug: string, name: string) => {
    await parseResponse(
      await fetch(`/api/admin/categories/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    );
    await load();
  };

  const updateSubCategoryName = async (slug: string, name: string) => {
    await parseResponse(
      await fetch(`/api/admin/sub-categories/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    );
    await load();
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    await parseResponse(
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      }),
    );
    setNewCategoryName("");
    await load();
  };

  const addSubCategory = async (categorySlug: string) => {
    const name = newSubNames[categorySlug]?.trim();
    if (!name) return;
    await parseResponse(
      await fetch("/api/admin/sub-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, categorySlug }),
      }),
    );
    setNewSubNames((current) => ({ ...current, [categorySlug]: "" }));
    await load();
  };

  const removeCategory = async (category: CategoryUsage) => {
    if (
      !window.confirm(
        `确定删除一级分类「${category.name}」吗？\n\n仅当该分类及下属二级分类均无产品时允许删除。`,
      )
    ) {
      return;
    }

    try {
      await parseResponse(
        await fetch(`/api/admin/categories/${encodeURIComponent(category.slug)}`, {
          method: "DELETE",
        }),
      );
      await load();
    } catch (deleteError) {
      window.alert(
        deleteError instanceof Error ? deleteError.message : "删除失败",
      );
    }
  };

  const removeSubCategory = async (subCategory: SubCategoryUsage) => {
    if (
      !window.confirm(
        `确定删除二级分类「${subCategory.name}」吗？\n\n仅当该分类下无产品时允许删除。`,
      )
    ) {
      return;
    }

    try {
      await parseResponse(
        await fetch(
          `/api/admin/sub-categories/${encodeURIComponent(subCategory.slug)}`,
          { method: "DELETE" },
        ),
      );
      await load();
    } catch (deleteError) {
      window.alert(
        deleteError instanceof Error ? deleteError.message : "删除失败",
      );
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">{adminCopy.loading}</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">分类管理</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
          产品通过 <code className="rounded bg-muted-bg px-1">slug</code>{" "}
          关联分类。修改分类名称会立即反映在所有产品上；修改 slug
          会自动迁移关联产品。有产品的分类不可删除；产品可在编辑页转移分类。
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="新增一级分类"
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
          placeholder="e.g. Wine Accessories"
          className="flex-1"
        />
        <Button type="button" onClick={() => void addCategory()}>
          添加一级分类
        </Button>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <section
            key={category.slug}
            className="overflow-hidden rounded-sm border border-border bg-surface"
          >
            <div className="flex flex-col gap-4 border-b border-border bg-muted-bg px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                <CategoryNameField
                  key={`${category.slug}-${category.name}`}
                  label="Category"
                  name={category.name}
                  onSave={(name) => updateCategoryName(category.slug, name)}
                />
                <p className="text-xs text-muted">
                  slug: <code>{category.slug}</code> · {category.productCount}{" "}
                  个产品
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={category.productCount > 0}
                title={
                  category.productCount > 0
                    ? "该分类下有产品，无法删除"
                    : undefined
                }
                onClick={() => void removeCategory(category)}
              >
                删除一级分类
              </Button>
            </div>

            <div className="divide-y divide-border">
              {category.subCategories.map((subCategory) => (
                <div
                  key={subCategory.slug}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end sm:justify-between"
                >
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                    <CategoryNameField
                      key={`${subCategory.slug}-${subCategory.name}`}
                      label="Sub-category"
                      name={subCategory.name}
                      onSave={(name) =>
                        updateSubCategoryName(subCategory.slug, name)
                      }
                    />
                    <p className="text-xs text-muted">
                      slug: <code>{subCategory.slug}</code> ·{" "}
                      {subCategory.productCount} 个产品
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={subCategory.productCount > 0}
                    title={
                      subCategory.productCount > 0
                        ? "该二级分类下有产品，无法删除"
                        : undefined
                    }
                    onClick={() => void removeSubCategory(subCategory)}
                  >
                    删除
                  </Button>
                </div>
              ))}

              <div className="flex flex-col gap-3 bg-muted-bg/40 px-5 py-4 sm:flex-row sm:items-end">
                <Input
                  label={`新增二级分类 · ${category.name}`}
                  value={newSubNames[category.slug] ?? ""}
                  onChange={(event) =>
                    setNewSubNames((current) => ({
                      ...current,
                      [category.slug]: event.target.value,
                    }))
                  }
                  placeholder="e.g. Wine Stoppers"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void addSubCategory(category.slug)}
                >
                  添加二级分类
                </Button>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function CategoryNameField({
  label,
  name,
  onSave,
}: {
  label: string;
  name: string;
  onSave: (name: string) => Promise<void>;
}) {
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) return;
    setSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-w-[220px] flex-1">
      <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-10 flex-1 rounded-sm border border-border bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <Button
          type="button"
          variant="outline"
          disabled={saving || value.trim() === name || !value.trim()}
          onClick={() => void save()}
        >
          {saving ? "..." : "保存"}
        </Button>
      </div>
    </div>
  );
}
