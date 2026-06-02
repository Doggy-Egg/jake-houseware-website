import { EditProductForm } from "@/components/admin/edit-product-form";
import { Container } from "@/components/ui/container";

type AdminEditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { id } = await params;

  return (
    <Container className="py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">编辑产品</h1>
        <p className="mt-1 text-sm text-muted">
          修改产品信息、规格和目录设置。
        </p>
      </div>
      <div className="max-w-4xl">
        <EditProductForm productId={id} />
      </div>
    </Container>
  );
}
