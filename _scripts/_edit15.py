path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = 'className="w-11 h-11 rounded-full border-2 border-cream/80 flex items-center justify-center text-cream hover:bg-cream/10 transition-colors"'
assert content.count(old) == 1, "old no matchea"
new = 'className="w-8 h-8 flex items-center justify-center text-cream hover:text-cream/70 transition-colors"'
content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - iconos sociales sin borde y mas chicos")
