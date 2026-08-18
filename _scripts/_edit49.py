path = "src/components/WhatsAppFloat.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''      className="fixed bottom-5 right-5 z-[55] bg-green hover:bg-green-dark text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"'''

new = '''      className="fixed bottom-20 sm:bottom-5 right-4 sm:right-5 z-[55] bg-green hover:bg-green-dark text-white w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: WhatsAppFloat no se encima con boton sticky")
