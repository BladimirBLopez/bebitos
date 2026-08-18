import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import { prisma } from "@/lib/prisma";

export default async function AdminProductosPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-cream">
      <AdminHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-brown-dark">
            Productos
          </h1>
          <Link
            href="/admin/productos/nuevo"
            className="bg-green hover:bg-green-dark text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors"
          >
            + Nuevo producto
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-ink/50 text-sm">Todavía no hay productos.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/admin/productos/${p.id}`}
                className="bg-white rounded-xl p-4 flex items-center justify-between hover:shadow transition-shadow"
              >
                <div>
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="text-sm text-ink/50">{p.category}</p>
                </div>
                <div className="text-right">
                  {p.isPromo && p.promoPrice ? (
                    <div>
                      <span className="text-xs text-red-400 line-through mr-1">
                        BOB {p.price}
                      </span>
                      <span className="font-semibold text-green">
                        BOB {p.promoPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-brown-dark">
                      BOB {p.price}
                    </span>
                  )}
                  {!p.inStock && (
                    <p className="text-xs text-red-400">Sin stock</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
