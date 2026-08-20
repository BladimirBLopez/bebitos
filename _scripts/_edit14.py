path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Agregar el @handle antes de la ubicacion, y achicar el icono de pin (ya quedo grande por los cambios globales anteriores)
old1 = '''        <p className="flex items-center gap-1 text-cream/90 text-sm mt-4 drop-shadow-sm">
          <PinIcon />
          Santa Cruz, Bolivia
        </p>'''
assert content.count(old1) == 1, "old1 no matchea"
new1 = '''        <p className="font-display font-bold text-cream text-xl mt-4 drop-shadow-sm">
          @bebitos.bo
        </p>
        <p className="flex items-center gap-1 text-cream/90 text-sm mt-2 drop-shadow-sm">
          <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4"><PinIcon /></span>
          Santa Cruz, Bolivia
        </p>'''
content = content.replace(old1, new1)

# 2. Iconos sociales: de circulo blanco relleno a circulo con contorno (outline), como la referencia
old2 = 'className="w-10 h-10 rounded-full bg-white border border-brown/15 shadow-sm flex items-center justify-center text-brown-dark hover:bg-brown-dark hover:text-cream transition-colors"'
assert content.count(old2) == 1, "old2 no matchea"
new2 = 'className="w-11 h-11 rounded-full border-2 border-cream/80 flex items-center justify-center text-cream hover:bg-cream/10 transition-colors"'
content = content.replace(old2, new2)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 2 reemplazos aplicados")
