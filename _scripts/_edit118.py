path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X, DollarSign, FileCheck } from "lucide-react";'''
new = '''import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X, DollarSign, FileCheck, Save } from "lucide-react";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: icono Save agregado al import")
