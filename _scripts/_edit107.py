path = "src/app/globals.css"
with open(path, "r") as f:
    content = f.read()

old = '''  --font-sans: var(--font-nunito);
  --font-display: var(--font-fredoka);
}'''

new = '''  --font-sans: var(--font-nunito);
  --font-display: var(--font-fredoka);
  --shadow-card: 0 1px 2px rgba(61, 43, 31, 0.04), 0 2px 8px rgba(61, 43, 31, 0.06);
  --shadow-card-hover: 0 2px 4px rgba(61, 43, 31, 0.06), 0 8px 20px rgba(61, 43, 31, 0.10);
}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: sombras suaves en capas agregadas al tema")
