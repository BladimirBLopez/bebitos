path = "src/components/Header.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-brown/15">'''

new = '''  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-brown/15 relative">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: Header con position relative para el overlay de busqueda")
