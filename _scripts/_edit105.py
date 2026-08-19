path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    <div className="min-h-screen bg-cream">
      <div className="relative h-40 sm:h-48 bg-brown-dark overflow-hidden">
        {backgroundImage && (
          <Image
            src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200,h_500,c_fill/${backgroundImage}`}
            alt=""
            fill
            className="object-cover opacity-45"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/20 to-brown-dark" />
      </div>

      <div className="flex flex-col items-center px-6 -mt-16">
        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[5px] border-cream shadow-xl overflow-hidden relative">
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
        </p>
        <p className="text-green-dark text-xs font-bold tracking-wide mt-2 mb-4">
          {shippingText} 🇧🇴
        </p>'''

new = '''    <div className="relative min-h-screen">
      <div className="absolute inset-0">
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
        <div className="absolute inset-0 bg-brown-dark/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/30 via-brown-dark/80 to-cream" />
      </div>

      <div className="relative flex flex-col items-center px-6 pt-14">
        <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-full border-[6px] border-cream shadow-2xl overflow-hidden relative">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
            alt="Bebitos"
            fill
            className="object-cover"
            priority
          />
        </div>

        <p className="flex items-center gap-1 text-cream/90 text-sm mt-4 drop-shadow-sm">
          <PinIcon />
          Santa Cruz, Bolivia
        </p>
        <p className="text-cream/95 text-sm text-center max-w-xs mt-2 leading-relaxed drop-shadow-sm">
          🍼 Bebitos | Todo para la alimentación de tu bebé. Encuentra platos, cucharas
          y accesorios seguros, prácticos y de alta calidad. ✨
        </p>
        <p className="text-green text-xs font-bold tracking-wide mt-2 mb-4 drop-shadow-sm">
          {shippingText} 🇧🇴
        </p>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: fondo completo restaurado, logo mas grande, texto con mejor contraste")
