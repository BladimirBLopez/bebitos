path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import QuickCategoryModal from "./QuickCategoryModal";'''
new = '''import CategoryManagerModal from "./CategoryManagerModal";'''
count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''  async function handleCreateCategory(name: string) {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const created: Category = await res.json();
      setCategories((c) => [...c, created].sort((a, b) => a.name.localeCompare(b.name)));
      update({ category: created.name });
      setCategoryModalOpen(false);
      showToast("Categoría creada", "success");
    } else {
      showToast("Esa categoría ya existe", "error");
    }
  }

'''
new2 = ''''''
count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''      <QuickCategoryModal
        open={categoryModalOpen}
        onSave={handleCreateCategory}
        onClose={() => setCategoryModalOpen(false)}
      />'''
new3 = '''      <CategoryManagerModal
        open={categoryModalOpen}
        categories={categories}
        setCategories={setCategories}
        onSelect={(name) => {
          update({ category: name });
          setCategoryModalOpen(false);
        }}
        onClose={() => setCategoryModalOpen(false)}
      />'''
count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

with open(path, "w") as f:
    f.write(content)
print("OK: reemplazado por CategoryManagerModal completo")
