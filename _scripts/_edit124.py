path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <div className="flex items-center gap-3 sticky bottom-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 sm:flex-none bg-green hover:bg-green-dark text-white font-semibold px-6 py-3 rounded-full transition-colors disabled:opacity-60 shadow-lg"
          >
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-500 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Borrar
            </button>
          )}
        </div>
      </form>'''

new = '''        <div className="h-16" />
        <div className="fixed bottom-0 left-0 right-0 sm:left-56 bg-white border-t border-brown/10 p-3 z-30">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-green hover:bg-green-dark text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar producto"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-500 text-sm font-medium shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Borrar
              </button>
            )}
          </div>
        </div>
      </form>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: barra completa fija abajo para guardar/borrar producto")
