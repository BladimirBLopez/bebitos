path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}'''

new = '''              value={featureInput}
              onChange={(e) => {
                setFeatureInput(e.target.value);
                if (e.target.value.trim()) setDirty(true);
              }}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''              value={colorName}
              onChange={(e) => setColorName(e.target.value)}'''

new2 = '''              value={colorName}
              onChange={(e) => {
                setColorName(e.target.value);
                if (e.target.value.trim()) setDirty(true);
              }}'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: escribir en caracteristicas o colores tambien marca cambios sin guardar")
