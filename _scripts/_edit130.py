path = "src/components/AdminSidebar.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import { LayoutDashboard, Package, Settings, LogOut, ExternalLink, Link2 } from "lucide-react";'''
new = '''import { LayoutDashboard, Package, Tag, Settings, LogOut, ExternalLink, Link2 } from "lucide-react";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''const NAV = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];'''

new2 = '''const NAV = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: Categorias agregada al sidebar")
