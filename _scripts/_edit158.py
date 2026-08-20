path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <SectionCard icon={DollarSign} title="Precio">
          <div className="mb-4">
            {showPrices ? (
              <>
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
              </>
            ) : (
              <p className="text-[11px] text-ink/40">
                Los precios no se muestran en tu tienda. Actívalos en{" "}
                <Link href="/admin/configuracion" className="underline">
                  Configuración → Precios
                </Link>{" "}
                para poder asignarle uno a este producto.
              </p>
            )}
          </div>

          <label className="text-xs font-medium text-ink/60 block mb-2">
            Estado del producto
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`text-sm font-medium py-2.5 rounded-xl border transition-colors ${
                  status === opt.value
                    ? "bg-brown-dark text-white border-brown-dark"
                    : "bg-cream text-ink/70 border-brown/15 hover:border-brown/30"
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>

          {status === "oferta" && (
            <div>
              <label className="text-xs font-medium text-ink/60 block mb-1">
                Precio de oferta (BOB)
              </label>
              <input
                type="number"
                value={form.promoPrice}
                onChange={(e) => update({ promoPrice: e.target.value })}
                className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              />
            </div>
          )}
        </SectionCard>'''

new = '''        <SectionCard icon={DollarSign} title="Precio">
          <div className={`grid gap-4 mb-4 ${status === "oferta" && showPrices ? "sm:grid-cols-2" : ""}`}>
            <div>
              {showPrices ? (
                <>
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
                </>
              ) : (
                <p className="text-[11px] text-ink/40">
                  Los precios no se muestran en tu tienda. Actívalos en{" "}
                  <Link href="/admin/configuracion" className="underline">
                    Configuración → Precios
                  </Link>{" "}
                  para poder asignarle uno a este producto.
                </p>
              )}
            </div>

            {status === "oferta" && showPrices && (
              <div>
                <label className="text-xs font-medium text-ink/60 block mb-1">
                  Precio de oferta (BOB)
                </label>
                <input
                  type="number"
                  value={form.promoPrice}
                  onChange={(e) => update({ promoPrice: e.target.value })}
                  className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
                />
              </div>
            )}
          </div>

          <label className="text-xs font-medium text-ink/60 block mb-2">
            Estado del producto
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`text-sm font-medium py-2.5 rounded-xl border transition-colors ${
                  status === opt.value
                    ? "bg-brown-dark text-white border-brown-dark"
                    : "bg-cream text-ink/70 border-brown/15 hover:border-brown/30"
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        </SectionCard>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: Precio y Precio de oferta lado a lado en pantallas anchas")
