path = "src/app/globals.css"
with open(path, "r") as f:
    content = f.read()

old = '''@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}'''

new = '''@import "tailwindcss";

:root {
  /* Identidad Bebitos */
  --cream: #FCF8ED;
  --brown: #B6794C;
  --brown-dark: #6B4226;
  --green: #85BF35;
  --green-dark: #6FA02A;
  --ink: #3D2B1F;

  --background: var(--cream);
  --foreground: var(--ink);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-cream: var(--cream);
  --color-brown: var(--brown);
  --color-brown-dark: var(--brown-dark);
  --color-green: var(--green);
  --color-green-dark: var(--green-dark);
  --color-ink: var(--ink);
  --font-sans: var(--font-nunito);
  --font-display: var(--font-fredoka);
}

body {
  background: var(--background);
  color: var(--foreground);
}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: globals.css actualizado")
