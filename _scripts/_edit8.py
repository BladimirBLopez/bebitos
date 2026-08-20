path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Botón: menos redondo (rounded-2xl en vez de rounded-full)
old1 = 'className="flex items-center gap-3 w-full bg-white hover:bg-cream/60 text-brown-dark rounded-full px-5 py-4 border border-brown/10 shadow-lg transition-colors"'
count1 = content.count(old1)
assert count1 == 4, f"old1 aparece {count1} veces, esperaba 4"
new1 = 'className="flex items-center gap-4 w-full bg-white hover:bg-cream/60 text-brown-dark rounded-2xl px-5 py-4 border border-brown/10 shadow-lg transition-colors"'
content = content.replace(old1, new1)

# 2. Circulo del icono: mas grande
old2 = 'className="w-11 h-11 rounded-full bg-brown-dark/10 text-brown-dark flex items-center justify-center shrink-0"'
count2 = content.count(old2)
assert count2 == 4, f"old2 aparece {count2} veces, esperaba 4"
new2 = 'className="w-14 h-14 rounded-full bg-brown-dark/10 text-brown-dark flex items-center justify-center shrink-0"'
content = content.replace(old2, new2)

# 3. Contenedor de texto: centrado en vez de izquierda, ocupa el resto del ancho
old3 = 'className="text-left"'
count3 = content.count(old3)
assert count3 == 4, f"old3 aparece {count3} veces, esperaba 4"
new3 = 'className="text-center flex-1"'
content = content.replace(old3, new3)

# 4. Titulo: text-base -> text-lg
old4 = 'font-display font-medium text-base'
count4 = content.count(old4)
assert count4 == 4, f"old4 aparece {count4} veces, esperaba 4"
new4 = 'font-display font-bold text-lg'
content = content.replace(old4, new4)

# 5. Subtitulo: text-xs -> text-sm
old5 = 'text-xs text-ink/50'
count5 = content.count(old5)
assert count5 == 4, f"old5 aparece {count5} veces, esperaba 4"
new5 = 'text-sm text-ink/50'
content = content.replace(old5, new5)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 5 reemplazos globales aplicados")
