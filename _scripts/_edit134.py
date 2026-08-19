path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''  const [categoryModalOpen, setCategoryModalOpen] = useState(false);'''
new = '''  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [showPrices, setShowPrices] = useState(true);'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (!form.category && data.length > 0) {
          setForm((f) => ({ ...f, category: data[0].name }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);'''

new2 = '''    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (!form.category && data.length > 0) {
          setForm((f) => ({ ...f, category: data[0].name }));
        }
      });
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setShowPrices(data?.showPrices ?? true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: showPrices agregado al formulario")
