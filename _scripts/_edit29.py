path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    <div className="min-h-screen bg-cream">
      <div className="flex flex-col items-center px-6 pt-14">'''

new = '''    <div className="min-h-screen bg-gradient-to-b from-brown/15 via-cream to-cream">
      <div className="flex flex-col items-center px-6 pt-14">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: degradado de fondo profesional aplicado")
