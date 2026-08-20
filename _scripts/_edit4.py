path = "src/app/links/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '            className="object-contain w-[92%] h-auto"'
assert content.count(old) == 1, "old no matchea"
new = '            className="object-contain w-[104%] h-auto"'
content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - logo agrandado a 104%")
