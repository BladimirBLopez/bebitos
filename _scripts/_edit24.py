path = "src/lib/cart-context.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Agregar constante de expiracion
old1 = 'const STORAGE_KEY = "bebitos_cart";'
assert content.count(old1) == 1, "old1 no matchea"
new1 = '''const STORAGE_KEY = "bebitos_cart";
const EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 horas sin actividad'''
content = content.replace(old1, new1)

# 2. Cambiar la carga inicial para soportar timestamp y expiracion
old2 = '''  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);'''
assert content.count(old2) == 1, "old2 no matchea"
new2 = '''  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // formato nuevo: { items, savedAt }. Si esta vencido, se descarta.
        if (parsed && Array.isArray(parsed.items)) {
          const isExpired = Date.now() - (parsed.savedAt || 0) > EXPIRY_MS;
          setItems(isExpired ? [] : parsed.items);
        } else if (Array.isArray(parsed)) {
          // formato viejo (solo array), lo migramos sin expirar esta vez
          setItems(parsed);
        }
      } catch {
        setItems([]);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, savedAt: Date.now() })
      );
    }
  }, [items, loaded]);'''
content = content.replace(old2, new2)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - expiracion de carrito implementada")
