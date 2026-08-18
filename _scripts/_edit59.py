path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    setSaving(false);

    if (res.ok) {
      showToast("Configuración guardada", "success");
    } else {
      showToast("No se pudo guardar", "error");
    }'''

new = '''    setSaving(false);

    if (res.ok) {
      showToast("Configuración guardada", "success");
    } else {
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || "No se pudo guardar", "error");
    }'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: Configuracion muestra mensaje real de la API")
