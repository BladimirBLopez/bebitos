path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''function CategoriesManager() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);'''

new = '''function CategoriesManager() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''  async function confirmDelete() {
    if (!toDelete) return;
    await fetch(`/api/admin/categories/${toDelete.id}`, { method: "DELETE" });
    setCategories((c) => c.filter((cat) => cat.id !== toDelete.id));
    showToast("Categoría borrada", "success");
    setToDelete(null);
  }'''

new2 = '''  async function confirmDelete() {
    if (!toDelete) return;
    await fetch(`/api/admin/categories/${toDelete.id}`, { method: "DELETE" });
    setCategories((c) => c.filter((cat) => cat.id !== toDelete.id));
    showToast("Categoría borrada", "success");
    setToDelete(null);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditValue(cat.name);
  }

  async function saveEdit(id: string) {
    if (!editValue.trim()) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue.trim() }),
    });

    if (res.ok) {
      const updated = await res.json();
      setCategories((c) =>
        c.map((cat) => (cat.id === id ? updated : cat)).sort((a, b) => a.name.localeCompare(b.name))
      );
      showToast("Categoría actualizada, productos sincronizados", "success");
      setEditingId(null);
    } else {
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || "No se pudo actualizar", "error");
    }
  }'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''      {!loading && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 bg-cream rounded-full pl-3 pr-2 py-1.5 text-sm">
              {c.name}
              <button onClick={() => setToDelete(c)} className="text-ink/30 hover:text-red-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}'''

new3 = '''      {!loading && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) =>
            editingId === c.id ? (
              <div key={c.id} className="flex items-center gap-1 bg-white border border-brown/20 rounded-full pl-3 pr-1.5 py-1">
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
                  className="text-sm outline-none w-24"
                />
                <button onClick={() => saveEdit(c.id)} className="text-green-dark text-xs font-semibold px-1.5">
                  Guardar
                </button>
                <button onClick={() => setEditingId(null)} className="text-ink/30 hover:text-red-400 px-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                key={c.id}
                onClick={() => startEdit(c)}
                className="flex items-center gap-1.5 bg-cream hover:bg-cream/70 rounded-full pl-3 pr-2 py-1.5 text-sm transition-colors"
              >
                {c.name}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setToDelete(c);
                  }}
                  className="text-ink/30 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              </button>
            )
          )}
        </div>
      )}
      <p className="text-[11px] text-ink/40 mt-2">Toca una categoría para editarla</p>'''

count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

with open(path, "w") as f:
    f.write(content)
print("OK: edicion de categorias en linea agregada")
