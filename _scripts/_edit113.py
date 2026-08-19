path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''      <CategoriesManager />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl mt-4">
        <SectionCard icon={MessageCircle} title="WhatsApp">'''

new = '''      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl mt-4">
        <p className="text-xs font-semibold text-brown-dark/50 uppercase tracking-wide mt-2">
          Contacto y redes
        </p>
        <SectionCard icon={MessageCircle} title="WhatsApp">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''        <SectionCard icon={Truck} title="Texto de envíos">'''
new2 = '''        <p className="text-xs font-semibold text-brown-dark/50 uppercase tracking-wide mt-3">
          Configuración de la tienda
        </p>
        <SectionCard icon={Truck} title="Texto de envíos">'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: subtitulos agregados")
