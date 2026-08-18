import AdminHeader from "@/components/AdminHeader";
import ProductForm from "@/components/ProductForm";

export default function NuevoProductoPage() {
  return (
    <div className="min-h-screen bg-cream">
      <AdminHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-semibold text-brown-dark mb-6">
          Nuevo producto
        </h1>
        <ProductForm />
      </main>
    </div>
  );
}
