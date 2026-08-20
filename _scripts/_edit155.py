path = "src/components/ProductCard.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        className="block bg-white rounded-2xl border border-brown/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-brown/20 transition-shadow"
      >'''

new = '''        className="flex flex-col h-full bg-white rounded-2xl border border-brown/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-brown/20 transition-shadow"
      >'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''        <div className="p-4">
          <h3 className="font-display font-medium text-ink text-base mb-1">
            {product.name}
          </h3>
          <p className="text-ink/60 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center gap-1.5 mb-3">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="w-4 h-4 rounded-full border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">'''

new2 = '''        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-display font-medium text-ink text-base mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-ink/60 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center gap-1.5 mb-3">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="w-4 h-4 rounded-full border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-auto">'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >'''

new3 = '''      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="h-full"
    >'''

count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

with open(path, "w") as f:
    f.write(content)
print("OK: tarjetas con altura consistente, precio/boton pegados al fondo")
