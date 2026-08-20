path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old1 = '''        <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-full border-[6px] border-cream shadow-2xl overflow-hidden relative bg-white flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={140}
            height={44}
            className="object-contain w-[62%] h-auto"
            priority
          />
        </div>'''
assert content.count(old1) == 1, "old1 no matchea"
new1 = '''        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[4px] border-white shadow-2xl overflow-hidden relative bg-white flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787203042/Dise%C3%B1o_sin_t%C3%ADtulo_10_yatmgd.png"
            alt="Bebitos"
            width={140}
            height={140}
            className="object-contain w-[70%] h-auto"
            priority
          />
        </div>'''
content = content.replace(old1, new1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - logo actualizado")
