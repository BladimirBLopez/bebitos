path = "src/components/Header.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={110}
            height={35}
            className="hidden sm:block object-contain"
          />'''

new = '''          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={90}
            height={28}
            className="object-contain w-[90px] sm:w-[110px] h-auto"
          />'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: logo horizontal visible en todas las pantallas")
