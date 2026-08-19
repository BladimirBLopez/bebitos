import { ShieldCheck, FlaskConical, Landmark, Baby, FileCheck } from "lucide-react";

const ITEMS = [
  {
    icon: FlaskConical,
    title: "¿Qué significa SGS?",
    text: "SGS es una organización internacional especializada en inspección, ensayos, verificación y certificación. En productos que están en contacto con alimentos, evalúa la seguridad y el cumplimiento de las normas aplicables al material y al producto.",
  },
  {
    icon: Landmark,
    title: "¿Y qué significa FDA?",
    text: "La FDA (Food and Drug Administration) es la autoridad regulatoria de Estados Unidos. Regula las sustancias y materiales que entran en contacto con los alimentos, con requisitos sobre composición, uso previsto y posible migración de sustancias.",
  },
  {
    icon: Baby,
    title: "¿Qué significa esto para tu bebé?",
    text: "No elegimos nuestros productos solo por su diseño. Nos importa conocer los materiales, su uso previsto y contar con documentación y ensayos que nos permitan ofrecerte productos con respaldo técnico de calidad.",
  },
];

export default function QualitySection({ reportUrl }: { reportUrl?: string }) {
  return (
    <section className="bg-white py-14 border-y border-brown/10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="w-12 h-12 rounded-full bg-brown-dark/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-brown-dark" />
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-brown-dark mb-3">
            Certificaciones y controles de calidad
          </h2>
          <p className="text-ink/60 text-sm sm:text-base max-w-2xl mx-auto">
            Cuando se trata de productos para nuestros bebés, la seguridad es lo primero.
            Seleccionamos productos que cumplen estándares de seguridad para su uso previsto,
            especialmente porque muchos están en contacto directo con los alimentos.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-cream rounded-2xl p-5">
                <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5 text-brown-dark" />
                </span>
                <p className="font-display font-semibold text-brown-dark text-sm mb-2">
                  {item.title}
                </p>
                <p className="text-ink/60 text-xs leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-brown-dark rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="hidden sm:flex w-14 h-14 rounded-full bg-cream/10 items-center justify-center shrink-0">
              <FileCheck className="w-7 h-7 text-cream" />
            </div>
            <div>
              <p className="font-display font-semibold text-cream text-base mb-1">
                Informe de laboratorio disponible
              </p>
              <p className="text-cream/70 text-sm">
                Nuestros sets de alimentación de silicona cuentan con informe de ensayo
                emitido por Shenzhen BYS Testing Co., Ltd., con aprobación FDA.
              </p>
            </div>
          </div>
          {reportUrl && (
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-green hover:bg-green-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors whitespace-nowrap"
            >
              Ver informe de calidad
            </a>
          )}
        </div>

        <p className="text-center text-ink/50 text-xs mt-6 max-w-xl mx-auto">
          Porque para tu bebé, cada elección importa. Y para nosotros, su seguridad también. 🤎
        </p>
      </div>
    </section>
  );
}
