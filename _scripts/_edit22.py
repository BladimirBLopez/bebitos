path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import { MessageCircle, MapPin, Instagram, Facebook, Music2, Truck } from "lucide-react";'''

new = '''import { MessageCircle, MapPin, Truck, AtSign } from "lucide-react";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

content = content.replace(
    '<SectionCard icon={Instagram} title="Instagram">',
    '<SectionCard icon={AtSign} title="Instagram">'
)
content = content.replace(
    '<SectionCard icon={Facebook} title="Facebook">',
    '<SectionCard icon={AtSign} title="Facebook">'
)
content = content.replace(
    '<SectionCard icon={Music2} title="TikTok">',
    '<SectionCard icon={AtSign} title="TikTok">'
)

with open(path, "w") as f:
    f.write(content)
print("OK: configuracion sin iconos de marca de lucide")
