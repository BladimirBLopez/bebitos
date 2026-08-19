path = "src/components/Header.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default function Header({
  instagramUrl = "https://www.instagram.com/bebitos.bo",
  facebookUrl = "https://www.facebook.com/share/1LfNHku3nT/?mibextid=wwXIfr",
  tiktokUrl = "https://www.tiktok.com/@bebitos_bo",
  categories = [],
}: HeaderProps) {'''

new = '''export default function Header({
  whatsapp,
  instagramUrl = "https://www.instagram.com/bebitos.bo",
  facebookUrl = "https://www.facebook.com/share/1LfNHku3nT/?mibextid=wwXIfr",
  tiktokUrl = "https://www.tiktok.com/@bebitos_bo",
  categories = [],
}: HeaderProps) {'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''          <SearchBar />
          <CartDrawer />
        </div>'''

new2 = '''          <SearchBar />
          <CartDrawer whatsapp={whatsapp} />
        </div>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: Header pasa whatsapp al CartDrawer")
