path = "src/components/ProductDetail.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import Header from "@/components/Header";
import RelatedProducts from "@/components/RelatedProducts";
import WhatsAppFloat from "@/components/WhatsAppFloat";'''

new = '''import Header from "@/components/Header";
import RelatedProducts from "@/components/RelatedProducts";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ShareButton from "@/components/ShareButton";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''        <nav className="text-sm text-brown-dark/60 mb-6 flex items-center gap-1.5 flex-wrap">
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

new2 = '''        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <nav className="text-sm text-brown-dark/60 flex items-center gap-1.5 flex-wrap">
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
          </nav>
          <ShareButton title={product.name} text={`Mira este producto en Bebitos: ${product.name}`} />
        </div>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: ProductDetail con boton de compartir")
