path = "src/components/ProductDetail.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <div className="grid sm:grid-cols-2 gap-8">
          <div className="aspect-square bg-cream rounded-2xl relative overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_800,h_800,c_fill/${product.images[0]}`}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brown/30">
                Foto pendiente
              </div>
            )}
          </div>

          <div>'''

new = '''        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-cream rounded-2xl relative overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_800,h_800,c_fill/${product.images[activeImage]}`}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brown/30">
                  Foto pendiente
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${
                      activeImage === i ? "border-brown-dark" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_100,h_100,c_fill/${img}`}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name);
  const [added, setAdded] = useState(false);'''

new2 = '''  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: galeria de fotos con miniaturas")
