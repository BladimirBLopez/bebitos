path = "src/components/CartDrawer.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";'''

new = '''"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 bg-brown-dark hover:bg-ink text-cream font-semibold text-sm px-3.5 py-2 rounded-full transition-colors"'''

new2 = '''      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 bg-brown-dark hover:bg-ink text-cream font-semibold text-sm p-2.5 sm:px-3.5 sm:py-2 rounded-full transition-colors"'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''        Carrito
        {totalItems > 0 && ('''

new3 = '''        <ShoppingBag className="w-4 h-4 sm:hidden" />
        <span className="hidden sm:inline">Carrito</span>
        {totalItems > 0 && ('''

count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

with open(path, "w") as f:
    f.write(content)
print("OK: CartDrawer con icono en movil")
