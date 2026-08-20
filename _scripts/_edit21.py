path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Agregar import
old1 = '''import Image from "next/image";
import { prisma } from "@/lib/prisma";'''
assert content.count(old1) == 1, "old1 no matchea"
new1 = '''import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ShareButton from "@/components/ShareButton";'''
content = content.replace(old1, new1)

# 2. Agregar el boton flotante arriba a la derecha, dentro del div relative min-h-screen
old2 = '''        <div className="absolute inset-0 bg-brown-dark/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/30 via-brown-dark/80 to-cream" />
      </div>
'''
assert content.count(old2) == 1, "old2 no matchea"
new2 = '''        <div className="absolute inset-0 bg-brown-dark/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/30 via-brown-dark/80 to-cream" />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ShareButton title="Bebitos" text="Bebitos | Todo para la alimentación de tu bebé" iconOnly />
      </div>
'''
content = content.replace(old2, new2)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - boton de compartir agregado")
