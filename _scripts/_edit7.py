path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Icono: agregar color de marca explicito
old1 = 'w-11 h-11 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0'
count1 = content.count(old1)
assert count1 == 4, f"old1 aparece {count1} veces, esperaba 4"
new1 = 'w-11 h-11 rounded-full bg-brown-dark/10 text-brown-dark flex items-center justify-center shrink-0'
content = content.replace(old1, new1)

# 2. Titulo: text-sm -> text-base
old2 = 'font-display font-medium text-sm'
count2 = content.count(old2)
assert count2 == 4, f"old2 aparece {count2} veces, esperaba 4"
new2 = 'font-display font-medium text-base'
content = content.replace(old2, new2)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 2 reemplazos globales aplicados")
