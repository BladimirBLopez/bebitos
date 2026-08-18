path = "src/components/MobileMenu.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''      {open && (
        <div className="fixed inset-0 z-[70] sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-72 max-w-[80%] h-full bg-cream flex flex-col">'''

new = '''      {open && (
        <div className="fixed inset-0 z-[70] sm:hidden h-dvh">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-72 max-w-[80%] h-dvh bg-cream flex flex-col shadow-xl">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: MobileMenu con h-dvh y sombra")
