path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787203042/Dise%C3%B1o_sin_t%C3%ADtulo_10_yatmgd.png"
            alt="Bebitos"
            width={140}
            height={140}
            className="object-contain w-[104%] h-auto"'''
assert content.count(old) == 1, "old no matchea"
new = '''            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787228252/bebitos_logo_circulo_etjyti.png"
            alt="Bebitos"
            width={140}
            height={140}
            className="object-contain w-full h-full"'''
content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - logo actualizado al circulo recortado")
