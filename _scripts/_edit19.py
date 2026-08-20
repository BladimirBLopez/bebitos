path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Boton: agregar 'relative' para poder posicionar el icono absoluto
old1 = 'className="flex items-center gap-3 w-full min-h-[64px] bg-white hover:bg-cream/60 text-brown-dark rounded-[24px] px-5 py-2.5 border border-brown/10 shadow-lg transition-colors"'
count1 = content.count(old1)
assert count1 == 4, f"old1 aparece {count1} veces, esperaba 4"
new1 = 'className="relative flex items-center justify-center w-full min-h-[64px] bg-white hover:bg-cream/60 text-brown-dark rounded-[24px] px-5 py-2.5 border border-brown/10 shadow-lg transition-colors"'
content = content.replace(old1, new1)

# 2. Icono: posicion absoluta a la izquierda
old2 = 'className="w-8 h-8 text-brown-dark flex items-center justify-center shrink-0"'
count2 = content.count(old2)
assert count2 == 4, f"old2 aparece {count2} veces, esperaba 4"
new2 = 'className="absolute left-5 w-8 h-8 text-brown-dark flex items-center justify-center shrink-0"'
content = content.replace(old2, new2)

# 3. Texto: centrado en todo el ancho del boton, ya no flex-1
old3 = 'className="text-center flex-1"'
count3 = content.count(old3)
assert count3 == 4, f"old3 aparece {count3} veces, esperaba 4"
new3 = 'className="text-center"'
content = content.replace(old3, new3)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 3 reemplazos globales aplicados")
