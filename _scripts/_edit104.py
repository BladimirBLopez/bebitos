path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''      <div className="relative flex flex-col items-center px-6 pt-16">
        <div className="w-36 h-36 rounded-full border-[5px] border-cream shadow-2xl overflow-hidden relative bg-white flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={104}
            height={33}
            className="object-contain w-[100px] h-auto"
            priority
          />
        </div>

        <h1 className="font-display text-2xl font-semibold text-brown-dark mt-3">
          Bebitos
        </h1>
        <p className="flex items-center gap-1 text-ink/60 text-sm mt-0.5">
          <PinIcon />
          Santa Cruz, Bolivia
        </p>'''

new = '''      <div className="relative flex flex-col items-center px-6 pt-16">
        <div className="w-36 h-36 rounded-full border-[5px] border-cream shadow-2xl overflow-hidden relative">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
            alt="Bebitos"
            fill
            className="object-cover"
            priority
          />
        </div>

        <p className="flex items-center gap-1 text-ink/60 text-sm mt-3">
          <PinIcon />
          Santa Cruz, Bolivia
        </p>
        <p className="text-ink/70 text-sm text-center max-w-xs mt-2 leading-relaxed">
          🍼 Bebitos | Todo para la alimentación de tu bebé. Encuentra platos, cucharas
          y accesorios seguros, prácticos y de alta calidad. ✨
        </p>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: logo original, sin titulo repetido, con bio de Facebook")
