import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

const GEMINI_MODEL = "gemini-flash-lite-latest";
const MAX_MESSAGES_PER_MINUTE = 8;

const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const timestamps = (requestLog.get(ip) || []).filter((t) => t > windowStart);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > MAX_MESSAGES_PER_MINUTE;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "El chat no está configurado todavía." },
        { status: 503 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Estás escribiendo muy rápido, espera un momento." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    if (messages.length === 0) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    const [settings, products] = await Promise.all([
      prisma.settings.findUnique({ where: { id: "singleton" } }),
      prisma.product.findMany({
        where: { stock: { gt: 0 } },
        orderBy: { order: "asc" },
        take: 60,
        select: {
          name: true,
          description: true,
          price: true,
          promoPrice: true,
          isPromo: true,
          category: true,
          stock: true,
        },
      }),
    ]);

    const catalogText = products
      .map((p) => {
        const price = p.isPromo && p.promoPrice ? p.promoPrice : p.price;
        const promoNote = p.isPromo && p.promoPrice ? ` (antes Bs. ${p.price})` : "";
        const shortDesc = p.description.slice(0, 140);
        return `- ${p.name} [${p.category}]: Bs. ${price}${promoNote} — ${shortDesc} — stock: ${p.stock}`;
      })
      .join("\n");

    const whatsapp = settings?.whatsapp || "";
    const shippingText = settings?.shippingText || "Envíos a nivel nacional";
    const businessHours = settings?.businessHours || "";
    const showPrices = settings?.showPrices ?? true;
    const mapsUrl = settings?.mapsUrl || "";

    const systemInstruction = `Eres el asistente de ventas de Bebitos, una tienda online boliviana de artículos para bebés.

Tu trabajo:
- Responder preguntas sobre productos, precios (si están habilitados) y disponibilidad, usando SOLO el catálogo de abajo.
- Ser cálido, breve y directo. Respuestas cortas, no párrafos largos.
- NUNCA uses formato Markdown (nada de **negrita**, guiones de lista, ni símbolos de formato). Escribe siempre en texto plano corrido, como en un chat de WhatsApp real.
- Si preguntan algo fuera del catálogo o no tienes el dato, dilo con honestidad, no inventes.
- Cuando el cliente muestre intención real de comprar (dice "lo quiero", "cómo compro", "me lo reservas", etc.), invítalo a cerrar la compra por WhatsApp${whatsapp ? ` al ${whatsapp}` : ""}, y sugiérele mencionar el nombre exacto del producto.
- Nunca proceses pagos ni prometas envíos que no puedas confirmar; para eso siempre deriva a WhatsApp.
- Envíos: ${shippingText}.
${businessHours ? `- Horario de atención: ${businessHours}.` : ""}
${mapsUrl ? `- Tenemos un punto físico en Santa Cruz. Si preguntan por la ubicación, SIEMPRE comparte este link de Google Maps: ${mapsUrl}.` : "- No hay una ubicación física para visitar; coordina todo por WhatsApp."}
- ${showPrices ? "Los precios SÍ están habilitados, puedes mencionarlos." : "Los precios NO están habilitados en la tienda por ahora — no des cifras, solo di que se confirma el precio por WhatsApp."}

Catálogo disponible ahora mismo (stock > 0):
${catalogText || "(No hay productos con stock disponible en este momento)"}
`;

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "");
      console.error("Gemini API error:", geminiRes.status, errText);
      return NextResponse.json(
        { error: "No se pudo procesar tu mensaje, intenta de nuevo en un momento." },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const rawReply: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Disculpa, no pude generar una respuesta. ¿Puedes reformular tu pregunta?";

    // Red de seguridad: si el modelo igual manda Markdown, lo limpiamos
    // porque el widget muestra texto plano, no Markdown renderizado.
    const reply = rawReply
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^[-*]\s+/gm, "");

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
