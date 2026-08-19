path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    <div className="bg-white rounded-2xl border border-brown/10 shadow-sm p-5">'''
new = '''    <div className="bg-white rounded-2xl border border-brown/10 p-5" style={{ boxShadow: "var(--shadow-card)" }}>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: formulario con sombras suaves")
