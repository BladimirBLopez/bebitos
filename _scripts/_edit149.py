path = "src/components/AdminSidebar.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <div className="flex items-center gap-3 sm:hidden">
          <Link href="/" target="_blank" className="text-cream/70" title="Ver tienda">
            <ExternalLink className="w-4.5 h-4.5" />
          </Link>
          <Link href="/links" target="_blank" className="text-cream/70" title="Ver links">
            <Link2 className="w-4.5 h-4.5" />
          </Link>
          <button onClick={handleLogout} className="text-cream/70">
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>'''

new = '''        <div className="flex items-center gap-1.5 sm:hidden">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 bg-cream/10 hover:bg-cream/20 text-cream/90 text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Tienda
          </Link>
          <Link
            href="/links"
            target="_blank"
            className="flex items-center gap-1 bg-cream/10 hover:bg-cream/20 text-cream/90 text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            Links
          </Link>
          <button onClick={handleLogout} className="text-cream/70 p-1.5">
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: botones Ver tienda y Ver links con texto visible en movil")
