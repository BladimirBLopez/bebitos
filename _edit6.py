path = "src/app/layout.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";'''

new = '''import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''      <body className="min-h-full flex flex-col font-sans">{children}</body>'''
new2 = '''      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>{children}</CartProvider>
      </body>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: layout.tsx con CartProvider")
