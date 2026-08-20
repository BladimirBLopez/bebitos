path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''          </div>

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

new = '''          </div>
        </SectionCard>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: botones de estado duplicados removidos")
