import { prisma } from "../src/lib/prisma";
import { products } from "../src/lib/products";

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        features: p.features,
        price: p.price,
        category: p.category,
        colors: p.colors,
        images: p.images,
      },
    });
    console.log("Producto insertado:", p.name);
  }
}

main()
  .then(() => {
    console.log("Seed completo");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
