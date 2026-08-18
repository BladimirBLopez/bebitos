path = "src/components/CartDrawer.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <div className="fixed inset-0 z-[60] flex justify-end h-dvh">'''
new = '''        <div className="fixed inset-0 z-[95] flex justify-end h-dvh">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: CartDrawer con z-index mas alto que el boton flotante")
