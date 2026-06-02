import { ProductForm } from "@/components/admin/product-form";
import { Container } from "@/components/ui/container";

export default function AdminNewProductPage() {
  return (
    <Container className="py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">新增产品</h1>
        <p className="mt-1 text-sm text-muted">
          添加新产品到批发目录。不选择精选系列即为普通商品。
        </p>
      </div>
      <div className="max-w-4xl">
        <ProductForm mode="create" />
      </div>
    </Container>
  );
}
