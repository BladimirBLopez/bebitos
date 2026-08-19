path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X, DollarSign, FileCheck, Save, Check } from "lucide-react";'''
new = '''import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X, DollarSign, FileCheck, Save, Check, Pencil } from "lucide-react";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''              <span className="text-xs text-ink/70">{p.name}</span>
              <span
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center ${
                  hasValue ? "bg-green text-white" : "bg-brown-dark/10 text-brown-dark"
                }`}
              >
                {hasValue ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              </span>'''

new2 = '''              <span className="text-xs text-ink/70">{p.name}</span>
              <span
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center ${
                  hasValue ? "bg-green text-white" : "bg-brown-dark/10 text-brown-dark"
                }`}
              >
                {hasValue ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              </span>
              {hasValue && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-brown/15 flex items-center justify-center text-brown-dark/50">
                  <Pencil className="w-2.5 h-2.5" />
                </span>
              )}'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: icono de lapiz discreto agregado")
