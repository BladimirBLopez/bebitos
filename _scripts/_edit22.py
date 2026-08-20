path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787228252/bebitos_logo_circulo_etjyti.png"'
assert content.count(old) == 1, "old no matchea"
new = '            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787250386/Dise%C3%B1o_sin_t%C3%ADtulo_10_w98gei.png"'
content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - logo de links actualizado")
