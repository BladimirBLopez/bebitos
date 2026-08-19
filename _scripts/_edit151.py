path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        {products.length === 0 ? (
          <p className="text-ink/50 text-sm">
            {q ? "No encontramos productos con ese nombre." : "Pronto vas a ver productos aqui."}
          </p>
        ) : ('''

new = '''        {products.length === 0 ? (
          q ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-brown-dark/10 flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-6 h-6 text-brown-dark" />
              </div>
              <p className="font-display text-lg font-semibold text-brown-dark mb-1">
                Sin resultados para &ldquo;{q}&rdquo;
              </p>
              <p className="text-ink/50 text-sm mb-5">
                Prueba con otra palabra o revisa el catálogo completo.
              </p>
              <Link
                href="/"
                className="inline-block bg-brown-dark hover:bg-ink text-cream font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
              >
                Ver todos los productos
              </Link>
            </div>
          ) : (
            <p className="text-ink/50 text-sm">Pronto vas a ver productos aqui.</p>
          )
        ) : ('''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: mensaje de sin resultados mejorado")
