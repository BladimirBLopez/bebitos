import ProductForm from "@/components/ProductForm";

export default function NuevoProductoPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brown-dark mb-6">
        Nuevo producto
      </h1>
      <ProductForm />
    </div>
  );
}
