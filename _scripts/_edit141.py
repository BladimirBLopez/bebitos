path = "prisma/schema.prisma"
with open(path, "r") as f:
    content = f.read()

old = '''  isNew       Boolean  @default(false)
  usageTips   String[] @default([])
  recommendedAge String @default("")
  createdAt   DateTime @default(now())'''

new = '''  isNew       Boolean  @default(false)
  usageTips   String[] @default([])
  recommendedAge String @default("")
  order       Int      @default(0)
  createdAt   DateTime @default(now())'''

if old in content:
    content = content.replace(old, new)
    print("aplico bloque con usageTips")
else:
    old2 = '''  isNew       Boolean  @default(false)
  createdAt   DateTime @default(now())'''
    new2 = '''  isNew       Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())'''
    assert old2 in content, "no se encontro ningun patron"
    content = content.replace(old2, new2)
    print("aplico bloque simple")

with open(path, "w") as f:
    f.write(content)
