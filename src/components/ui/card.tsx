import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
};

export function Card({ children, className, href }: CardProps) {
  const classes = cn(
    "group rounded-sm border border-border bg-surface transition-colors",
    href && "hover:border-accent/30 hover:shadow-sm",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}

type CardImageProps = {
  src?: string;
  alt: string;
  aspectRatio?: "square" | "product" | "wide";
  className?: string;
};

const aspectRatios = {
  square: "aspect-square",
  product: "aspect-[4/5]",
  wide: "aspect-[16/9]",
};

export function CardImage({
  src,
  alt,
  aspectRatio = "square",
  className,
}: CardImageProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-white",
        aspectRatios[aspectRatio],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-12 w-12 rounded-full border border-border bg-white" />
        </div>
      )}
    </div>
  );
}

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

type CardTitleProps = {
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
};

export function CardTitle({
  children,
  className,
  as: Component = "h3",
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        "text-base font-medium tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </Component>
  );
}

type CardDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn("mt-1.5 text-sm leading-relaxed text-muted", className)}>
      {children}
    </p>
  );
}
