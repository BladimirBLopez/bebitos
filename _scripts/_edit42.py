path = "src/components/CategoryFilter.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default function CategoryFilter({ products }: { products: Product[] }) {
  const [active, setActive] = useState("Todas");'''

new = '''export default function CategoryFilter({
  products,
  initialCategory,
}: {
  products: Product[];
  initialCategory?: string;
}) {
  const [active, setActive] = useState(initialCategory || "Todas");'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: CategoryFilter acepta categoria inicial de la URL")
