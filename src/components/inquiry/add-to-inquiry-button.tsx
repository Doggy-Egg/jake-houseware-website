"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useInquiry } from "@/context/inquiry/inquiry-context";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product";

type AddToInquiryButtonProps = {
  product: Product;
  className?: string;
};

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 3.5v11M3.5 9h11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 9.5 7.5 12.5 13.5 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ProductCardInquiryActionProps = {
  product: Product;
};

function InquiryActionTooltip({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-sm",
        "bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md",
        "opacity-0 transition-opacity duration-150 group-hover/inquiry:opacity-100",
      )}
      role="tooltip"
    >
      {label}
    </span>
  );
}

export function ProductCardInquiryAction({
  product,
}: ProductCardInquiryActionProps) {
  const { addItem, isInList, isHydrated } = useInquiry();
  const inList = isHydrated && isInList(product.id);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!inList) {
      addItem(product);
    }
  };

  const actionClassName = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
  );

  if (inList) {
    return (
      <div className="group/inquiry absolute bottom-4 right-4 z-20">
        <InquiryActionTooltip label="View Inquiry" />
        <Link
          href="/inquiry"
          onClick={(event) => event.stopPropagation()}
          className={cn(
            actionClassName,
            "border border-accent/30 bg-accent-light text-accent hover:bg-accent hover:text-accent-foreground",
          )}
          aria-label="View in inquiry list"
        >
          <CheckIcon />
        </Link>
      </div>
    );
  }

  return (
    <div className="group/inquiry absolute bottom-4 right-4 z-20">
      <InquiryActionTooltip label="Add to Inquiry" />
      <button
        type="button"
        onClick={handleClick}
        disabled={!isHydrated}
        className={cn(
          actionClassName,
          "border border-border bg-surface text-foreground shadow-sm",
          "hover:border-accent hover:bg-accent hover:text-accent-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-label="Add to inquiry list"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

export function AddToInquiryButton({
  product,
  className,
}: AddToInquiryButtonProps) {
  const { addItem, isInList, isHydrated } = useInquiry();
  const inList = isHydrated && isInList(product.id);

  const handleAdd = () => {
    addItem(product);
  };

  if (inList) {
    return (
      <div className={className}>
        <Button href="/inquiry" variant="outline" className="w-full sm:w-auto">
          View in Inquiry List
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        type="button"
        onClick={handleAdd}
        className="w-full sm:w-auto"
        disabled={!isHydrated}
      >
        Add to Inquiry List
      </Button>
    </div>
  );
}

type InquiryNavLinkProps = {
  compact?: boolean;
};

export function InquiryNavLink({ compact = false }: InquiryNavLinkProps) {
  const pathname = usePathname();
  const { itemCount, isHydrated } = useInquiry();
  const isActive = pathname.startsWith("/inquiry");

  return (
    <Link
      href="/inquiry"
      className={cn(
        "text-sm font-medium transition-colors",
        isActive
          ? "text-accent"
          : "text-accent hover:text-accent-hover",
      )}
    >
      {compact ? "Inquiry" : "Inquiry List"}
      {isHydrated && itemCount > 0 ? (
        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-gold bg-gold px-1.5 text-xs font-semibold text-gold-foreground">
          {itemCount}
        </span>
      ) : null}
    </Link>
  );
}
