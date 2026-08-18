path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    setSaving(false);

    if (!res.ok) {
      showToast("No se pudo guardar. Revisa los datos.", "error");
      return;
    }'''

new = '''    setSaving(false);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || "No se pudo guardar. Revisa los datos.", "error");
      return;
    }'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: ProductForm muestra mensaje real de la API")
