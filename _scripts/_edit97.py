path = "src/components/CartDrawer.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''const WHATSAPP_NUMBER = "59169501208";

export default function CartDrawer() {'''

new = '''export default function CartDrawer({ whatsapp }: { whatsapp?: string }) {
  const WHATSAPP_NUMBER = whatsapp || "59169501208";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: CartDrawer acepta whatsapp como prop")
