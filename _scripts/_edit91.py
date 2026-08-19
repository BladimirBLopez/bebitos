path = "src/components/MobileMenu.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''              <Link href="/links" onClick={() => setOpen(false)} className="py-2.5 text-ink font-medium">
                Nuestros enlaces
              </Link>'''

new = '''              <Link href="/links" onClick={() => setOpen(false)} className="py-2.5 text-ink font-medium">
                Nuestros enlaces
              </Link>
              <Link href="/calidad" onClick={() => setOpen(false)} className="py-2.5 text-ink font-medium">
                Calidad y seguridad
              </Link>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: link calidad en menu movil")
