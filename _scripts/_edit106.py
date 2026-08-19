path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-full border-[6px] border-cream shadow-2xl overflow-hidden relative">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
            alt="Bebitos"
            fill
            className="object-cover"
            priority
          />
        </div>'''

new = '''        <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-full border-[6px] border-cream shadow-2xl overflow-hidden relative bg-white flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={140}
            height={44}
            className="object-contain w-[62%] h-auto"
            priority
          />
        </div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: logo horizontal limpio dentro del circulo con fondo blanco")
