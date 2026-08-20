path = "src/components/Footer.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        Bebitos © {new Date().getFullYear()} · Todos los derechos reservados'''
new = '''        Bebitos © 2024 · Todos los derechos reservados'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: año fijo a 2024 en Footer")
