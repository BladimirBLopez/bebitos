path = "src/components/AdminSidebar.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import { LayoutDashboard, Package, Settings, LogOut, ExternalLink } from "lucide-react";'''
new = '''import { LayoutDashboard, Package, Settings, LogOut, ExternalLink, Link2 } from "lucide-react";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''        <div className="flex items-center gap-3 sm:hidden">
          <Link href="/" target="_blank" className="text-cream/70">
            <ExternalLink className="w-4.5 h-4.5" />
          </Link>
          <button onClick={handleLogout} className="text-cream/70">
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>'''

new2 = '''        <div className="flex items-center gap-3 sm:hidden">
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

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''          <ExternalLink className="w-4 h-4 shrink-0" />
          Ver página web
        </Link>
        <button
          onClick={handleLogout}'''

new3 = '''          <ExternalLink className="w-4 h-4 shrink-0" />
          Ver tienda
        </Link>
        <Link
          href="/links"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors"
        >
          <Link2 className="w-4 h-4 shrink-0" />
          Ver links
        </Link>
        <button
          onClick={handleLogout}'''

count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

with open(path, "w") as f:
    f.write(content)
print("OK: link 'Ver links' agregado, 'Ver pagina web' renombrado a 'Ver tienda'")
