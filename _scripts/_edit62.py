path = "src/components/ProductDetail.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import ShareButton from "@/components/ShareButton";'''
new = '''import ShareButton from "@/components/ShareButton";
import Footer from "@/components/Footer";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''type Settings = {
  whatsapp?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
};'''

new2 = '''type Settings = {
  whatsapp?: string;
  mapsUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  businessHours?: string;
};'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''      <RelatedProducts products={related} />'''
new3 = '''      <RelatedProducts products={related} />

      <Footer
        whatsapp={settings?.whatsapp}
        mapsUrl={settings?.mapsUrl}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
        businessHours={settings?.businessHours}
        categories={categories}
      />'''

count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

with open(path, "w") as f:
    f.write(content)
print("OK: ProductDetail con Footer")
