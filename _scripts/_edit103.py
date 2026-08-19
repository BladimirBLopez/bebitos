path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/40 via-brown-dark/60 to-cream/95" />
      </div>

      <div className="relative flex flex-col items-center px-6 pt-14">
        <div className="w-28 h-28 rounded-full border-4 border-cream shadow-lg overflow-hidden relative bg-white flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={80}
            height={25}
            className="object-contain w-[76px] h-auto"
            priority
          />
        </div>'''

new = '''        <div className="absolute inset-0 bg-brown-dark/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/30 via-brown-dark/70 to-cream" />
      </div>

      <div className="relative flex flex-col items-center px-6 pt-16">
        <div className="w-36 h-36 rounded-full border-[5px] border-cream shadow-2xl overflow-hidden relative bg-white flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={104}
            height={33}
            className="object-contain w-[100px] h-auto"
            priority
          />
        </div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: logo mas grande, degradado con color de marca integrado")
