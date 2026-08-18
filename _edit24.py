path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''      <ConfirmModal
        open={unsavedWarning}
        title="Cambios sin guardar"
        message="Tienes cambios sin guardar. Si sales ahora, se perderán."
        onConfirm={() => router.push("/admin/productos")}
        onCancel={() => setUnsavedWarning(false)}
      />'''

new = '''      <ConfirmModal
        open={unsavedWarning}
        title="Cambios sin guardar"
        message="Tienes cambios sin guardar. Si sales ahora, se perderán."
        confirmLabel="Salir sin guardar"
        danger={false}
        onConfirm={() => router.push("/admin/productos")}
        onCancel={() => setUnsavedWarning(false)}
      />'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: modal de cambios sin guardar corregido")
