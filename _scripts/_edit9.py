path = "src/app/producto/[slug]/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { products } from "@/lib/products";

const WHATSAPP_NUMBER = "59169501208";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const whatsappMessage = encodeURIComponent(
    `Hola! Me interesa: ${product.name} (BOB ${product.price})`
  );

  return ('''

new = '''import { notFound } from "next/navigation";
import { products } from "@/lib/products";
import ProductDetail from "@/components/ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

function _unused() {
  return ('''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

with open(path, "w") as f:
    f.write(content)
print("OK: page.tsx del producto delega a ProductDetail")
