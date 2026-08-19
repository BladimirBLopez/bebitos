path = "src/app/api/admin/settings/route.ts"
with open(path, "r") as f:
    content = f.read()

old = '''      showPrices: data.showPrices,
    },
  });'''

new = '''      showPrices: data.showPrices,
      qualityReportUrl: data.qualityReportUrl,
    },
  });'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: API guarda qualityReportUrl")
