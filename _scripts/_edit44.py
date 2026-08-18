path = "src/components/ProductDetail.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''type Settings = {
  whatsapp?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
};

export default function ProductDetail({
  product,
  settings,
  related = [],
}: {
  product: Product;
  settings?: Settings;
  related?: Product[];
}) {'''

new = '''type Settings = {
  whatsapp?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
};

type Category = { id: string; name: string };

export default function ProductDetail({
  product,
  settings,
  related = [],
  categories = [],
}: {
  product: Product;
  settings?: Settings;
  related?: Product[];
  categories?: Category[];
}) {'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''      <Header
        whatsapp={settings?.whatsapp}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
      />
      <main className="max-w-6xl w-full mx-auto px-4 py-8 pb-24 sm:pb-8">
        <Link
          href="/"
          className="text-sm text-brown-dark/70 hover:text-brown-dark inline-block mb-6"
        >
          ← Volver al catálogo
        </Link>'''

new2 = '''      <Header
        whatsapp={settings?.whatsapp}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
        categories={categories}
      />
      <main className="max-w-6xl w-full mx-auto px-4 py-8 pb-24 sm:pb-8">
        <nav className="text-sm text-brown-dark/60 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-brown-dark transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link
            href={`/?categoria=${encodeURIComponent(product.category)}`}
            className="hover:text-brown-dark transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-brown-dark font-medium">{product.name}</span>
        </nav>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: ProductDetail con breadcrumb y categorias")
