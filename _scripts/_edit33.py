path = "src/components/ProductDetail.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''                  <span className="font-display font-semibold text-brown-dark text-2xl">
                    BOB {product.price}
                  </span>'''

assert content.count(old) == 1, "old no matchea"

new = '''                  <span
                    className={`font-display font-semibold text-2xl ${
                      product.inStock === false ? "text-ink/30" : "text-brown-dark"
                    }`}
                  >
                    BOB {product.price}
                  </span>'''

content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - precio de producto agotado pasa a gris en desktop")
