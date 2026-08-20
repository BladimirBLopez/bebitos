path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Boton: menos alto, menos padding
old1 = 'className="flex items-center gap-4 w-full min-h-[92px] bg-white hover:bg-cream/60 text-brown-dark rounded-[28px] px-6 py-5 border border-brown/10 shadow-lg transition-colors"'
count1 = content.count(old1)
assert count1 == 4, f"old1 aparece {count1} veces, esperaba 4"
new1 = 'className="flex items-center gap-3 w-full min-h-[76px] bg-white hover:bg-cream/60 text-brown-dark rounded-[28px] px-5 py-3.5 border border-brown/10 shadow-lg transition-colors"'
content = content.replace(old1, new1)

# 2. Icono: contenedor mas grande, casi sin padding
old2 = 'className="w-10 h-10 text-brown-dark flex items-center justify-center shrink-0"'
count2 = content.count(old2)
assert count2 == 4, f"old2 aparece {count2} veces, esperaba 4"
new2 = 'className="w-12 h-12 text-brown-dark flex items-center justify-center shrink-0"'
content = content.replace(old2, new2)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 2 reemplazos globales aplicados")
