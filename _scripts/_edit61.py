path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import Testimonials from "@/components/Testimonials";
import { prisma } from "@/lib/prisma";'''
new = '''import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''      <Testimonials />
      <WhatsAppFloat whatsapp={settings?.whatsapp} />
    </div>
  );
}'''

new2 = '''      <Testimonials />
      <Footer
        whatsapp={settings?.whatsapp}
        mapsUrl={settings?.mapsUrl}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
        businessHours={settings?.businessHours}
        categories={categories}
      />
      <WhatsAppFloat whatsapp={settings?.whatsapp} />
    </div>
  );
}'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: page.tsx con Footer")
