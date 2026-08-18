path = "src/components/CartDrawer.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <div className="fixed inset-0 z-[60] flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-cream h-full flex flex-col shadow-xl">'''

new = '''        <div className="fixed inset-0 z-[60] flex justify-end h-dvh">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-cream h-dvh flex flex-col shadow-xl">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

with open(path, "w") as f:
    f.write(content)
print("OK: CartDrawer.tsx con h-dvh")
