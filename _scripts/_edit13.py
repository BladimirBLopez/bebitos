path = "src/app/admin/productos/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import { prisma } from "@/lib/prisma";'''

new = '''import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: pagina de productos ahora dinamica")
