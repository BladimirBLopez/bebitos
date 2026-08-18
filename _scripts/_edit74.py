path = "src/components/ProductDetail.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default function ProductDetail({
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

new = '''export default function ProductDetail({
  product,
  settings,
  related = [],
  categories = [],
  showPrices = true,
}: {
  product: Product;
  settings?: Settings;
  related?: Product[];
  categories?: Category[];
  showPrices?: boolean;
}) {'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''            {/* Botón normal en desktop, se oculta en móvil (ahí usamos el sticky de abajo) */}
            <div className="hidden sm:block border-t border-brown/10 pt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold text-brown-dark text-2xl">
                  BOB {product.price}
                </span>
                <button
                  onClick={handleAdd}
                  className="bg-green hover:bg-green-dark text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
                >
                  {added ? "¡Agregado! ✓" : "Agregar al carrito"}
                </button>
              </div>
              <a
                href={`https://wa.me/${settings?.whatsapp || "59169501208"}?text=${encodeURIComponent(`Hola! Tengo una consulta sobre: ${product.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-brown-dark/70 hover:text-brown-dark border border-brown/15 hover:border-brown/30 py-2 rounded-full transition-colors"
              >
                ¿Tienes dudas? Consulta por WhatsApp
              </a>
            </div>'''

new2 = '''            {/* Botón normal en desktop, se oculta en móvil (ahí usamos el sticky de abajo) */}
            <div className="hidden sm:block border-t border-brown/10 pt-5">
              {showPrices ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-semibold text-brown-dark text-2xl">
                      BOB {product.price}
                    </span>
                    <button
                      onClick={handleAdd}
                      className="bg-green hover:bg-green-dark text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
                    >
                      {added ? "¡Agregado! ✓" : "Agregar al carrito"}
                    </button>
                  </div>
                  <a
                    href={`https://wa.me/${settings?.whatsapp || "59169501208"}?text=${encodeURIComponent(`Hola! Tengo una consulta sobre: ${product.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-sm text-brown-dark/70 hover:text-brown-dark border border-brown/15 hover:border-brown/30 py-2 rounded-full transition-colors"
                  >
                    ¿Tienes dudas? Consulta por WhatsApp
                  </a>
                </>
              ) : (
                <a
                  href={`https://wa.me/${settings?.whatsapp || "59169501208"}?text=${encodeURIComponent(`Hola! Quiero consultar el precio de: ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-green hover:bg-green-dark text-white font-semibold py-2.5 rounded-full transition-colors"
                >
                  Consultar precio por WhatsApp
                </a>
              )}
            </div>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''      <RelatedProducts products={related} />'''
new3 = '''      <RelatedProducts products={related} showPrices={showPrices} />'''

count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

old4 = '''      {/* Barra sticky solo en móvil */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brown/10 px-4 py-3 flex items-center justify-between gap-3 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <span className="font-display font-semibold text-brown-dark text-xl shrink-0">
          BOB {product.price}
        </span>
        <button
          onClick={handleAdd}
          className="flex-1 bg-green hover:bg-green-dark text-white font-semibold py-2.5 rounded-full transition-colors"
        >
          {added ? "¡Agregado! ✓" : "Agregar al carrito"}
        </button>
      </div>'''

new4 = '''      {/* Barra sticky solo en móvil */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brown/10 px-4 py-3 flex items-center justify-between gap-3 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        {showPrices ? (
          <>
            <span className="font-display font-semibold text-brown-dark text-xl shrink-0">
              BOB {product.price}
            </span>
            <button
              onClick={handleAdd}
              className="flex-1 bg-green hover:bg-green-dark text-white font-semibold py-2.5 rounded-full transition-colors"
            >
              {added ? "¡Agregado! ✓" : "Agregar al carrito"}
            </button>
          </>
        ) : (
          <a
            href={`https://wa.me/${settings?.whatsapp || "59169501208"}?text=${encodeURIComponent(`Hola! Quiero consultar el precio de: ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-green hover:bg-green-dark text-white font-semibold py-2.5 rounded-full transition-colors"
          >
            Consultar precio por WhatsApp
          </a>
        )}
      </div>'''

count4 = content.count(old4)
assert count4 == 1, f"Encontrado {count4} veces, se esperaba 1"
content = content.replace(old4, new4)

with open(path, "w") as f:
    f.write(content)
print("OK: ProductDetail con soporte completo showPrices")
