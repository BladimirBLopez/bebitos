path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";'''

new = '''import Testimonials from "@/components/Testimonials";
import QualitySection from "@/components/QualitySection";
import Footer from "@/components/Footer";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''      <Testimonials />
      <Footer'''

new2 = '''      <QualitySection reportUrl={settings?.qualityReportUrl} />
      <Testimonials />
      <Footer'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: page.tsx con QualitySection")
