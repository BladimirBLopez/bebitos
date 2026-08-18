path = "src/app/admin/productos/[id]/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import { notFound } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import ProductForm from "@/components/ProductForm";
import { prisma } from "@/lib/prisma";'''

new = '''import { notFound } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import ProductForm from "@/components/ProductForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: pagina de editar ahora dinamica")
