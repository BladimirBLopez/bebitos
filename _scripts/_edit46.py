path = "src/components/Header.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import CartDrawer from "./CartDrawer";'''

new = '''import Image from "next/image";
import Link from "next/link";
import CartDrawer from "./CartDrawer";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''export default function Header({
  whatsapp = "59169501208",
  instagramUrl = "https://www.instagram.com/bebitos.bo",'''
new2 = '''export default function Header({
  instagramUrl = "https://www.instagram.com/bebitos.bo",'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''        <div className="flex items-center gap-1.5 sm:gap-3">
          <SearchBar />
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green hover:bg-green-dark text-white font-semibold text-sm p-2.5 sm:px-4 sm:py-2 rounded-full transition-colors flex items-center"
          >
            <MessageCircle className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <CartDrawer />
        </div>'''

new3 = '''        <div className="flex items-center gap-1.5 sm:gap-3">
          <SearchBar />
          <CartDrawer />
        </div>'''

count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

with open(path, "w") as f:
    f.write(content)
print("OK: Header sin boton de WhatsApp")
