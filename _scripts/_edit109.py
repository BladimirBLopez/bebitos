path = "src/components/ProductsListClient.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''              <div
                key={p.id}
                className={`bg-white rounded-xl p-3 flex items-center gap-3 transition-shadow group ${
                  isSelected ? "ring-2 ring-brown-dark/30" : ""
                }`}
              >'''

new = '''              <div
                key={p.id}
                className={`bg-white rounded-xl p-3 flex items-center gap-3 transition-shadow group hover:[box-shadow:var(--shadow-card-hover)] ${
                  isSelected ? "ring-2 ring-brown-dark/30" : ""
                }`}
                style={{ boxShadow: "var(--shadow-card)" }}
              >'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: sombras suaves aplicadas a lista de productos")
