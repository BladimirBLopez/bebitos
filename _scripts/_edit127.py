path = "src/components/ProductForm.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''              <p className="text-[11px] text-ink/40 mt-1">
                ¿Falta una categoría? Créala en Configuración
              </p>'''

new = '''              <button
                type="button"
                onClick={() => setCategoryModalOpen(true)}
                className="text-[11px] text-brown-dark/70 hover:text-brown-dark underline mt-1"
              >
                ¿Falta una categoría? Créala aquí
              </button>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''import ConfirmModal from "./ConfirmModal";'''
new2 = '''import ConfirmModal from "./ConfirmModal";
import QuickCategoryModal from "./QuickCategoryModal";'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''      <ConfirmModal
        open={unsavedWarning}'''

new3 = '''      <QuickCategoryModal
        open={categoryModalOpen}
        onSave={handleCreateCategory}
        onClose={() => setCategoryModalOpen(false)}
      />

      <ConfirmModal
        open={unsavedWarning}'''

count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

with open(path, "w") as f:
    f.write(content)
print("OK: modal conectado al formulario de producto")
