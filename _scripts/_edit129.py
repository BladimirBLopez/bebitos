path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''                ¿Falta una categoría? Créala aquí'''
new = '''                Gestionar categorías'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: texto del boton actualizado")
