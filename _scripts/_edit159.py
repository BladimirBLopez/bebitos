path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''            <div>
              <label className="text-xs font-medium text-ink/60 block mb-1">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => update({ category: e.target.value })}
                className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              >
                {categories.length === 0 && <option value="">Sin categorías</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(true)}
                className="text-[11px] text-brown-dark/70 hover:text-brown-dark underline mt-1"
              >
                Gestionar categorías
              </button>
            </div>
          </div>
        </SectionCard>'''

new = '''            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink/60 block mb-1">
                  Categoría
                </label>
                <select
                  value={form.category}
                  onChange={(e) => update({ category: e.target.value })}
                  className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
                >
                  {categories.length === 0 && <option value="">Sin categorías</option>}
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(true)}
                  className="text-[11px] text-brown-dark/70 hover:text-brown-dark underline mt-1"
                >
                  Gestionar categorías
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-ink/60 block mb-1">
                  Estado del producto
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusOption)}
                  className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </SectionCard>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: paso 1 - Categoria y Estado como selectores en 2 columnas")
