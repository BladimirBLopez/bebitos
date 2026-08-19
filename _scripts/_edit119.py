path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <div className="h-4" />
        <div className="sticky bottom-4 z-30">
          <button
            type="submit"
            disabled={saving}
            className="bg-green hover:bg-green-dark text-white font-semibold px-6 py-3 rounded-full transition-colors disabled:opacity-60 shadow-xl"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>'''

new = '''        <div className="h-16" />
        <div className="fixed bottom-0 left-0 right-0 sm:left-56 bg-white border-t border-brown/10 p-3 z-30">
          <button
            type="submit"
            disabled={saving}
            className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 bg-brown-dark hover:bg-ink text-cream font-semibold py-3 rounded-full transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: barra completa fija abajo aplicada correctamente")
