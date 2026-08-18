path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import Header from "@/components/Header";
import Hero from "@/components/Hero";'''
new = '''import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhatsAppFloat from "@/components/WhatsAppFloat";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''      <Testimonials />
    </div>
  );
}'''
new2 = '''      <Testimonials />
      <WhatsAppFloat whatsapp={settings?.whatsapp} />
    </div>
  );
}'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: page.tsx con WhatsAppFloat")
