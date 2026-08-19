path = "src/app/admin/(panel)/configuracion/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''  shippingText: string;
  businessHours: string;
  showPrices: boolean;
};'''

new = '''  shippingText: string;
  businessHours: string;
  showPrices: boolean;
  qualityReportUrl: string;
};'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: tipo actualizado con qualityReportUrl")
