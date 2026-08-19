path = "src/components/ProductsListClient.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    setBulkAction(null);
    if (res.ok) {
      showToast(`${ids.length} producto(s) actualizado(s)`, "success");
      setSelected(new Set());
      router.refresh();
    } else {
      showToast("No se pudo completar la acción", "error");
    }
  }'''

new = '''    setBulkAction(null);
    if (res.ok) {
      if (action === "eliminar") {
        setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      } else {
        setProducts((prev) =>
          prev.map((p) => (ids.includes(p.id) ? { ...p, inStock: action === "activar" } : p))
        );
      }
      showToast(`${ids.length} producto(s) actualizado(s)`, "success");
      setSelected(new Set());
      router.refresh();
    } else {
      showToast("No se pudo completar la acción", "error");
    }
  }'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: estado local actualizado en acciones en lote")
