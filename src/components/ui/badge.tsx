import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "accent" | "outline";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variants: Record<BadgeVariant, string> = {
  default: "bg-muted-bg text-foreground border-border",
  accent: "bg-accent-light text-accent border-accent/20",
  outline: "bg-transparent text-muted border-border",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
