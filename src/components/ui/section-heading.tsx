import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === "center" && "text-center",
        className,
      )}
    >
      {eyebrow ? (
        <div
          className={cn(
            "flex items-center gap-3",
            align === "center" && "justify-center",
          )}
        >
          <span className="h-0.5 w-10 shrink-0 bg-gold" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            {eyebrow}
          </p>
          <span
            className={cn(
              "hidden h-0.5 w-10 shrink-0 bg-gold sm:block",
              align === "center" && "block",
            )}
            aria-hidden="true"
          />
        </div>
      ) : null}
      <h2
        className={cn(
          "text-2xl font-semibold tracking-tight text-foreground md:text-3xl",
          eyebrow && "mt-3",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-3 max-w-2xl text-base leading-relaxed text-muted",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
