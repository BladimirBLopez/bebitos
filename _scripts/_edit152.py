path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import Header from "@/components/Header";'''
new = '''import Link from "next/link";
import { SearchX } from "lucide-react";
import Header from "@/components/Header";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: imports agregados")
