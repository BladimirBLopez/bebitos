path = "src/lib/types.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''  isNew?: boolean;
  category: string;
  colors: ProductColor[];
  images: string[]; // Cloudinary public_ids
};'''
assert content.count(old) == 1, "old no matchea"
new = '''  isNew?: boolean;
  inStock?: boolean;
  category: string;
  colors: ProductColor[];
  images: string[]; // Cloudinary public_ids
};'''
content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - inStock agregado al tipo Product")
