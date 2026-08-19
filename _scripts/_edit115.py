path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <button
          type="submit"
          disabled={saving}
          className="self-start bg-green hover:bg-green-dark text-white font-semibold px-6 py-3 rounded-full transition-colors disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}'''

new = '''        <div className="h-4" />
        <div className="sticky bottom-4 z-30">
          <button
            type="submit"
            disabled={saving}
            className="bg-green hover:bg-green-dark text-white font-semibold px-6 py-3 rounded-full transition-colors disabled:opacity-60 shadow-xl"
          >
            {saving ? "Guardando..." : "Guardar cambios"}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: paso 1 aplicado")
