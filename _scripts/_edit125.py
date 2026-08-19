path = "src/app/layout.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''const SITE_URL = "https://bebitos-sable.vercel.app";'''
new = '''const SITE_URL = "https://bebitos.online";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: SITE_URL actualizado al dominio real")
