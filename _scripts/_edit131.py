path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <CategoriesManager />
        <SectionCard icon={Truck} title="Texto de envíos">'''

new = '''        <SectionCard icon={Truck} title="Texto de envíos">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: CategoriesManager removido de Configuracion")
