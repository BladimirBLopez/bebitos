path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <div className="w-28 h-28 rounded-full border-4 border-cream shadow-lg overflow-hidden relative bg-white">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
            alt="Bebitos"
            fill
            className="object-contain p-1"
            priority
          />
        </div>'''

new = '''        <div className="w-28 h-28 rounded-full border-4 border-cream shadow-lg overflow-hidden relative bg-white flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={80}
            height={25}
            className="object-contain w-[76px] h-auto"
            priority
          />
        </div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: logo horizontal limpio dentro del circulo con fondo blanco")
