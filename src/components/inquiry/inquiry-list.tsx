"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { InquirySubmissionForm } from "@/components/inquiry/inquiry-submission-form";
import { useInquiry } from "@/context/inquiry/inquiry-context";

export function InquiryListContent() {
  const { items, removeItem, updateQuantity, clearItems, isHydrated } =
    useInquiry();
  const [successMessage, setSuccessMessage] = useState("");

  if (!isHydrated) {
    return (
      <div className="rounded-sm border border-border bg-muted-bg px-6 py-16 text-center">
        <p className="text-sm text-muted">Loading inquiry list...</p>
      </div>
    );
  }

  if (items.length === 0 && !successMessage) {
    return (
      <div className="rounded-sm border border-dashed border-border bg-muted-bg px-6 py-16 text-center">
        <p className="text-sm text-muted">Your inquiry list is empty.</p>
        <p className="mt-2 text-sm text-muted">
          Browse products and add items to request a wholesale quote.
        </p>
        <Button href="/products" variant="outline" className="mt-6">
          Browse Products
        </Button>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="rounded-sm border border-accent/20 bg-accent-light px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-accent">Inquiry Submitted</h2>
        <p className="mt-3 text-sm text-accent">{successMessage}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/products" variant="outline">
            Continue Browsing
          </Button>
          <Button href="/contact">Contact Us</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-sm border border-border">
        <div className="hidden border-b border-border bg-muted-bg px-6 py-3 text-xs font-medium uppercase tracking-widest text-muted md:grid md:grid-cols-[minmax(0,1fr)_120px_80px] md:gap-4">
          <span>Product</span>
          <span>Quantity</span>
          <span />
        </div>

        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.productId}
              className="grid gap-4 px-6 py-5 md:grid-cols-[minmax(0,1fr)_120px_80px] md:items-center"
            >
              <div className="flex min-w-0 items-center gap-4">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-white"
                >
                  {item.productImage ? (
                    <ProductImage
                      src={item.productImage}
                      alt={item.productItemNo}
                      fill
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center">
                      <div className="h-8 w-8 rounded-full border border-border bg-white" />
                    </div>
                  )}
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="font-medium text-foreground hover:text-accent"
                  >
                    {item.productItemNo}
                  </Link>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`qty-${item.productId}`}
                  className="mb-1 block text-xs text-muted md:sr-only"
                >
                  Quantity
                </label>
                <input
                  id={`qty-${item.productId}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    updateQuantity(
                      item.productId,
                      Math.max(1, Number(event.target.value) || 1),
                    )
                  }
                  className="h-10 w-full rounded-sm border border-border bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex md:justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {items.length} product{items.length === 1 ? "" : "s"} in your inquiry
          list
        </p>
        <Button variant="outline" type="button" onClick={clearItems}>
          Clear List
        </Button>
      </div>

      <InquirySubmissionForm
        onSuccess={() =>
          setSuccessMessage(
            "Thank you. Your inquiry has been received. Our team will respond within one business day.",
          )
        }
      />
    </div>
  );
}
