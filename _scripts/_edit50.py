path = "src/components/Header.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-brown/15">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">'''

new = '''    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-brown/15">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: header con menos padding vertical, logo del mismo tamano")
