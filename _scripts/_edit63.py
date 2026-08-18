path = "src/app/producto/[slug]/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''      settings={{
        whatsapp: settings?.whatsapp,
        instagramUrl: settings?.instagramUrl,
        facebookUrl: settings?.facebookUrl,
        tiktokUrl: settings?.tiktokUrl,
      }}'''

new = '''      settings={{
        whatsapp: settings?.whatsapp,
        mapsUrl: settings?.mapsUrl,
        instagramUrl: settings?.instagramUrl,
        facebookUrl: settings?.facebookUrl,
        tiktokUrl: settings?.tiktokUrl,
        businessHours: settings?.businessHours,
      }}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: pagina de producto pasa mapsUrl y businessHours")
