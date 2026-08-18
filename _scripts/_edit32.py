path = "src/app/api/admin/products/[id]/route.ts"
with open(path, "r") as f:
    content = f.read()

old = '''      inStock: data.inStock,
      isPromo: data.isPromo,
      promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : null,
    },
  });

  return NextResponse.json(product);
}'''

new = '''      inStock: data.inStock,
      isPromo: data.isPromo,
      isNew: data.isNew || false,
      promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : null,
    },
  });

  return NextResponse.json(product);
}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: PUT products guarda isNew")
