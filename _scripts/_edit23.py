path = "src/components/ProductDetail.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = 'className="max-w-6xl w-full mx-auto px-4 py-8 pb-24 sm:pb-8"'
assert content.count(old) == 1, "old no matchea"
new = 'className="max-w-6xl w-full mx-auto px-4 py-8 pb-20 sm:pb-8"'
content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - padding inferior reducido")
