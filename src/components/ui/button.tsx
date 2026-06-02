import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const variants = {
  /** Solid wine red — default on light backgrounds */
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover border border-transparent",
  secondary:
    "bg-surface text-foreground hover:bg-muted-bg border border-border",
  /** Wine outline on light backgrounds */
  outline:
    "bg-transparent text-accent hover:bg-accent-light border border-accent",
  ghost:
    "bg-transparent text-foreground hover:bg-muted-bg border border-transparent",
  link: "bg-transparent text-accent hover:text-accent-hover border border-transparent underline-offset-4 hover:underline p-0 h-auto",
  /** Solid light button on wine/dark sections */
  onDark:
    "bg-accent-foreground text-accent hover:bg-accent-foreground/90 border border-transparent",
  /** Light outline on wine/dark sections */
  onDarkOutline:
    "bg-transparent text-accent-foreground border border-accent-foreground/45 hover:bg-accent-foreground/10",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.ComponentProps<typeof Link>, "className"> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
    variant !== "link" && sizes[size],
    variants[variant],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link
        href={href}
        className={buttonClassName(variant, size, className)}
        {...linkProps}
      >
        {children}
      </Link>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      className={buttonClassName(variant, size, className)}
      type={buttonProps.type ?? "button"}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
