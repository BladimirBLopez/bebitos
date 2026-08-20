path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Estilo del botón: de solido oscuro a pill blanco/crema, mas redondo, sombra marcada
old1 = 'className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"'
count1 = content.count(old1)
assert count1 == 4, f"old1 aparece {count1} veces, esperaba 4"
new1 = 'className="flex items-center gap-3 w-full bg-white hover:bg-cream/60 text-brown-dark rounded-full px-5 py-4 border border-brown/10 shadow-lg transition-colors"'
content = content.replace(old1, new1)

# 2. Fondo del circulo del icono: de cream/15 a brown-dark/10
old2 = 'className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0"'
count2 = content.count(old2)
assert count2 == 4, f"old2 aparece {count2} veces, esperaba 4"
new2 = 'className="w-11 h-11 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0"'
content = content.replace(old2, new2)

# 3. Color del subtitulo: de cream/70 a ink/50
old3 = 'text-cream/70'
count3 = content.count(old3)
assert count3 == 4, f"old3 aparece {count3} veces, esperaba 4"
new3 = 'text-ink/50'
content = content.replace(old3, new3)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 3 reemplazos globales aplicados")
