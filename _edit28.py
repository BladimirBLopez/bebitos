path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    <div className="min-h-screen bg-cream">
      {/* Banda superior con degradado */}
      <div className="h-32 bg-gradient-to-br from-brown-dark to-brown relative" />

      <div className="flex flex-col items-center px-6 -mt-12">
        <Image
          src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
          alt="Bebitos"
          width={96}
          height={96}
          className="rounded-full border-4 border-cream shadow-md"
          priority
        />'''

new = '''    <div className="min-h-screen bg-cream">
      <div className="flex flex-col items-center px-6 pt-14">
        <Image
          src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
          alt="Bebitos"
          width={96}
          height={96}
          className="rounded-full shadow-md"
          priority
        />'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: portada eliminada, fondo limpio")
