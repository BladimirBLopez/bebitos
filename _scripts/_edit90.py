path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import QualitySection from "@/components/QualitySection";'''
new = '''import QualityBadgeBar from "@/components/QualityBadgeBar";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''      <QualitySection reportUrl={settings?.qualityReportUrl} />'''
new2 = '''      <QualityBadgeBar />'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: home usa franja chica en vez de seccion completa")
