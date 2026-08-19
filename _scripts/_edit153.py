path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <p className="text-ink/30 text-xs mt-8 mb-6">Bebitos © 2026</p>'''
new = '''        <p className="text-ink/30 text-xs mt-8 mb-6">Bebitos © 2024</p>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: año cambiado a 2024")
