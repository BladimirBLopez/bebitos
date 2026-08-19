path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <SectionCard icon={Tag} title="Características">
          <div className="flex gap-2 mb-3">
            <input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              className="flex-1 border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              placeholder="Ej: Silicona 100% segura"
            />
            <button
              type="button"
              onClick={addFeature}
              className="bg-brown-dark text-white w-10 rounded-xl flex items-center justify-center shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>'''

new = '''        <SectionCard icon={Tag} title="Características">
          <div className="flex gap-2 mb-3">
            <input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
              className="flex-1 border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              placeholder="Ej: Silicona 100% segura"
            />
            <button
              type="button"
              onClick={addFeature}
              className="bg-brown-dark text-white w-10 rounded-xl flex items-center justify-center shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''        <SectionCard icon={Palette} title="Colores disponibles">
          <div className="flex gap-2 mb-3 items-center">
            <input
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="flex-1 border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              placeholder="Ej: Verde"
            />
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-11 h-11 rounded-xl shrink-0"
            />
            <button
              type="button"
              onClick={addColor}
              className="bg-brown-dark text-white w-10 h-11 rounded-xl flex items-center justify-center shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>'''

new2 = '''        <SectionCard icon={Palette} title="Colores disponibles">
          <div className="flex gap-2 flex-wrap mb-3">
            {[
              { name: "Verde", hex: "#85BF35" },
              { name: "Rosado", hex: "#F5A3C7" },
              { name: "Celeste", hex: "#8FC7E8" },
              { name: "Amarillo", hex: "#F5D547" },
              { name: "Blanco", hex: "#F5F0E8" },
              { name: "Gris", hex: "#B0AFA8" },
            ].map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => update({ colors: [...form.colors, preset] })}
                className="flex items-center gap-1.5 bg-white border border-brown/15 hover:border-brown/30 rounded-full pl-1.5 pr-3 py-1 text-xs transition-colors"
              >
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                {preset.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-3 items-center">
            <input
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addColor();
                }
              }}
              className="flex-1 border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              placeholder="Otro color..."
            />
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-11 h-11 rounded-xl shrink-0"
            />
            <button
              type="button"
              onClick={addColor}
              className="bg-brown-dark text-white w-10 h-11 rounded-xl flex items-center justify-center shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: Enter para agregar + colores predefinidos aplicados")
