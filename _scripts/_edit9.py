path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = 'w-5 h-5'
count = content.count(old)
assert count == 7, f"aparece {count} veces, esperaba 7"
new = 'w-7 h-7'
content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 7 iconos agrandados")
