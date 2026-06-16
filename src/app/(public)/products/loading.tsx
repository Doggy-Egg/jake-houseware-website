import { Container } from "@/components/ui/container";

export default function ProductsLoading() {
  return (
    <Container as="main" className="py-16 md:py-20">
      <div className="h-4 w-24 animate-pulse rounded-sm bg-muted-bg" />
      <div className="mt-4 h-10 w-64 max-w-full animate-pulse rounded-sm bg-muted-bg" />
      <div className="mt-3 h-5 w-full max-w-2xl animate-pulse rounded-sm bg-muted-bg" />

      <div className="mt-10 space-y-6">
        <div className="h-11 max-w-md animate-pulse rounded-sm bg-muted-bg" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-24 animate-pulse rounded-sm bg-muted-bg"
            />
          ))}
        </div>
        <div className="h-4 w-32 animate-pulse rounded-sm bg-muted-bg" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse rounded-sm bg-muted-bg"
            />
          ))}
        </div>
      </div>
    </Container>
  );
}
