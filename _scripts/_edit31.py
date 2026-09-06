path = "src/lib/cart-context.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''  function addItem(product: Product, color?: string) {
    setItems((prev) => {'''

assert content.count(old) == 1, "old no matchea"

new = '''  function addItem(product: Product, color?: string) {
    // No permitir agregar productos agotados al carrito
    if (product.inStock === false) return;

    setItems((prev) => {'''

content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - protección contra productos agotados agregada al carrito")
