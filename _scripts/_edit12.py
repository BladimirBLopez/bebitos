path = ".env"
with open(path, "r") as f:
    content = f.read()

old = 'ADMIN_SECRET="un-texto-secreto-largo-y-random-cambiamelo-tambien"'
new = 'ADMIN_SECRET="bebitos-panel-2026-x7k9mQpL3vRt8wZnF"'

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: .env actualizado")
