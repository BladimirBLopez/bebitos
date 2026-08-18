path = "src/components/Header.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''          <span className="font-display font-semibold text-xl text-brown-dark hidden sm:block">
            Bebitos
          </span>'''

new = '''          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={110}
            height={35}
            className="hidden sm:block object-contain"
          />'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: Header con logo horizontal")
