import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QualitySection from "@/components/QualitySection";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Calidad y seguridad | Bebitos",
  description: "Certificaciones SGS y FDA de los productos Bebitos.",
};

export default async function CalidadPage() {
  const [settings, categories] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "singleton" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Header
        whatsapp={settings?.whatsapp}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
        categories={categories}
      />
      <main className="flex-1">
        <QualitySection reportUrl={settings?.qualityReportUrl} />
      </main>
      <Footer
        whatsapp={settings?.whatsapp}
        mapsUrl={settings?.mapsUrl}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
        businessHours={settings?.businessHours}
        categories={categories}
      />
    </div>
  );
}
