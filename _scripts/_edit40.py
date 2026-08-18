path = "src/components/Header.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
            alt="Bebitos"
            width={44}
            height={44}
            className="rounded-full"
            priority
          />
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={90}
            height={28}
            className="object-contain w-[90px] sm:w-[110px] h-auto"
          />
        </Link>'''

new = '''        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={150}
            height={47}
            className="object-contain w-[140px] sm:w-[170px] h-auto"
            priority
          />
        </Link>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: solo logo horizontal, mas grande")
