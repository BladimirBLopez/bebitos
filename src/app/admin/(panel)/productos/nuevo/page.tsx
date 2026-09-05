import ProductForm from "@/components/ProductForm";
import PageHeader from "@/components/PageHeader";

export default function NuevoProductoPage() {
  return (
    <div>
      <PageHeader title="Nuevo producto" meta="Se agrega a tu catálogo al guardar" />
      <ProductForm />
    </div>
  );
}