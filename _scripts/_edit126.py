path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''  const [unsavedWarning, setUnsavedWarning] = useState(false);
  const [dirty, setDirty] = useState(false);'''

new = '''  const [unsavedWarning, setUnsavedWarning] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {'''

new2 = '''  async function handleCreateCategory(name: string) {
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

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: paso 1 - estado y funcion de crear categoria agregados")
