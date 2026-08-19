path = "src/components/AdminSidebar.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <div className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
            alt="Bebitos"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-display font-semibold text-cream text-sm hidden sm:block">
            Panel Bebitos
          </span>
        </div>'''

new = '''        <div className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={110}
            height={35}
            className="object-contain w-[100px] h-auto brightness-0 invert opacity-90"
          />
        </div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: logo horizontal en sidebar admin")
