path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <p className="text-xs font-semibold text-brown-dark/50 uppercase tracking-wide mt-3">
          Configuración de la tienda
        </p>
        <SectionCard icon={Truck} title="Texto de envíos">'''

new = '''        <p className="text-xs font-semibold text-brown-dark/50 uppercase tracking-wide mt-3">
          Configuración de la tienda
        </p>
        <CategoriesManager />
        <SectionCard icon={Truck} title="Texto de envíos">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: CategoriesManager restaurado en su nueva ubicacion")
