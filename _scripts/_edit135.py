path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <SectionCard icon={DollarSign} title="Precio">
          <div className="mb-4">
            <label className="text-xs font-medium text-ink/60 block mb-1">
              Precio (BOB)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update({ price: e.target.value })}
              className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              required
            />
          </div>'''

new = '''        <SectionCard icon={DollarSign} title="Precio">
          <div className="mb-4">
            <label className="text-xs font-medium text-ink/60 block mb-1">
              Precio (BOB)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update({ price: e.target.value })}
              className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              required={showPrices}
            />
            {!showPrices && (
              <p className="text-[11px] text-ink/40 mt-1">
                Los precios no se muestran en tu tienda. Actívalos en{" "}
                <Link href="/admin/configuracion" className="underline">
                  Configuración → Precios
                </Link>{" "}
                para que sean visibles.
              </p>
            )}
          </div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: campo de precio opcional con aviso agregado")
