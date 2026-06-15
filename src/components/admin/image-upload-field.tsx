"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminCopy } from "@/lib/constants/admin";
import { cn } from "@/lib/utils/cn";

type ImageUploadFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

function parseImages(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const images = parseImages(value);

  const updateImages = (nextImages: string[]) => {
    onChange(nextImages.join("\n"));
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError(null);

    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = (await response.json()) as {
          url?: string;
          message?: string;
        };

        if (!response.ok || !data.url) {
          throw new Error(data.message ?? "上传失败");
        }

        uploadedUrls.push(data.url);
      }

      updateImages([...images, ...uploadedUrls]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "上传失败，请重试",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    updateImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">Scene Images（场景图）</p>
        <p className="mt-1 text-sm text-muted">
          产品详情页展示全部场景图。列表、询价单等位置使用 1:1 主图（Primary Image）。
          支持 JPG、PNG、WebP、GIF，单张最大 5MB。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "上传中..." : "从本地上传"}
        </Button>
        <span className="text-xs text-muted">
          保存至 Supabase Storage（product-images）
        </span>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {images.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={`${image}-${index}`}
              className="overflow-hidden rounded-sm border border-border bg-surface"
            >
              <div className="aspect-[4/5] bg-muted-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`产品图片 ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-xs text-muted">{image}</p>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-xs font-medium text-muted transition-colors hover:text-foreground"
                >
                  移除
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className={cn(
            "rounded-sm border border-dashed border-border bg-muted-bg px-4 py-10 text-center text-sm text-muted",
          )}
        >
          {adminCopy.noImages}
        </div>
      )}

      <div>
        <label
          htmlFor="image-urls"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          图片 URL（选填，每行一个）
        </label>
        <textarea
          id="image-urls"
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={"/images/products/my-product.jpg\nhttps://example.com/image.jpg"}
          className="flex w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
    </div>
  );
}
