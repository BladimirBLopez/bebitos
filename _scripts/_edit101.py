path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    <div className="min-h-screen bg-cream">
      <div className="fixed inset-0 -z-10">
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

      <div className="flex flex-col items-center px-6 pt-14">'''

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
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/40 via-brown-dark/60 to-cream/95" />
      </div>

      <div className="relative flex flex-col items-center px-6 pt-14">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: fondo corregido con absolute en vez de fixed, sin bg solido tapando")
