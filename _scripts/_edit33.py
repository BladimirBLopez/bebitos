path = "package.json"
with open(path, "r") as f:
    content = f.read()

old = '"name": "bebitos-tmp",'
new = '"name": "bebitos",'

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: nombre del proyecto corregido")
