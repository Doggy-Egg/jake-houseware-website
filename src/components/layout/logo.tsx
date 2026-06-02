import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/constants/brand";
import { cn } from "@/lib/utils/cn";

type LogoProps = {
  className?: string;
  height?: number;
};

export function Logo({ className, height = 36 }: LogoProps) {
  const width = Math.round((height / brand.logo.height) * brand.logo.width);

  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label={brand.logo.alt}
    >
      <Image
        src={brand.logo.full}
        alt={brand.logo.alt}
        width={width}
        height={height}
        priority
        className="h-auto w-auto"
        style={{ height, width: "auto", maxWidth: width }}
      />
    </Link>
  );
}
