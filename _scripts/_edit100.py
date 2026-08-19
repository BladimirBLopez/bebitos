path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''      <div className="relative h-56 sm:h-64 overflow-hidden">
        {backgroundImage ? (
          <Image
            src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200,h_500,c_fill,e_blur:300/${backgroundImage}`}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-brown-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/50 via-brown-dark/70 to-cream" />
      </div>

      <div className="flex flex-col items-center px-6 -mt-16">
        <div className="w-28 h-28 rounded-full border-4 border-cream shadow-lg overflow-hidden relative bg-white">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
            alt="Bebitos"
            fill
            className="object-cover scale-110"
            priority
          />
        </div>'''

new = '''      <div className="fixed inset-0 -z-10">
        {backgroundImage ? (
          <Image
            src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200,h_2400,c_fill,e_blur:400/${backgroundImage}`}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-brown-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/40 via-brown-dark/60 to-cream/95" />
      </div>

      <div className="flex flex-col items-center px-6 pt-14">
        <div className="w-28 h-28 rounded-full border-4 border-cream shadow-lg overflow-hidden relative bg-white">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
            alt="Bebitos"
            fill
            className="object-contain p-1"
            priority
          />
        </div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: logo circular completo, fondo cubre toda la pantalla")
