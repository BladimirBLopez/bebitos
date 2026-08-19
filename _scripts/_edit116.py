path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''            {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>'''

new = '''            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: div de cierre agregado")
