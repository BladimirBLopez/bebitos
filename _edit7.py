path = "src/components/Header.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import Image from "next/image";
import Link from "next/link";'''

new = '''import Image from "next/image";
import Link from "next/link";
import CartDrawer from "./CartDrawer";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green hover:bg-green-dark text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors"
          >
            WhatsApp
          </a>
        </div>'''

new2 = '''          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green hover:bg-green-dark text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors"
          >
            WhatsApp
          </a>
          <CartDrawer />
        </div>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: Header.tsx con CartDrawer")
