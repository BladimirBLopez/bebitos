path = "src/components/ProductsListClient.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''  async function handleDelete() {
    if (!toDelete) return;
    const res = await fetch(`/api/admin/products/${toDelete.id}`, { method: "DELETE" });
    setToDelete(null);

    if (res.ok) {
      showToast(`"${toDelete.name}" fue borrado`, "success");
      router.refresh();
    } else {
      showToast("No se pudo borrar el producto", "error");
    }
  }'''

new = '''  async function handleDelete() {
    if (!toDelete) return;
    const res = await fetch(`/api/admin/products/${toDelete.id}`, { method: "DELETE" });
    const deletedName = toDelete.name;
    const deletedId = toDelete.id;
    setToDelete(null);

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== deletedId));
      showToast(`"${deletedName}" fue borrado`, "success");
      router.refresh();
    } else {
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || "No se pudo borrar el producto", "error");
    }
  }'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: estado local actualizado al borrar")
