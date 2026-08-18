path = "src/components/ProductDetail.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import Header from "@/components/Header";
import RelatedProducts from "@/components/RelatedProducts";'''
new = '''import Header from "@/components/Header";
import RelatedProducts from "@/components/RelatedProducts";
import WhatsAppFloat from "@/components/WhatsAppFloat";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''          {added ? "¡Agregado! ✓" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}'''
new2 = '''          {added ? "¡Agregado! ✓" : "Agregar al carrito"}
        </button>
      </div>

      <WhatsAppFloat whatsapp={settings?.whatsapp} />
    </div>
  );
}'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: ProductDetail con WhatsAppFloat")
