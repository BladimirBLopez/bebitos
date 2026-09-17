import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

const GEMINI_MODEL = "gemini-flash-lite-latest";
const MAX_MESSAGES_PER_MINUTE = 8;
const MAX_CHAT_PRODUCTS = 3;

const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const timestamps = (requestLog.get(ip) || []).filter((t) => t > windowStart);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > MAX_MESSAGES_PER_MINUTE;
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getTerms(text: string) {
  const ignored = new Set([
    "quiero",
    "busco",
    "tienen",
    "tienes",
    "mostrar",
    "muestrame",
    "muéstrame",
    "producto",
    "productos",
    "para",
    "por",
    "una",
    "uno",
    "unos",
    "unas",
    "del",
    "las",
    "los",
    "que",
    "como",
    "algo",
    "ver",
    "hay",
    "con",
    "más",
    "mas",
    "opciones",
    "opcion",
  ]);

  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3 && !ignored.has(word));
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "El chat no está configurado todavía." },
        { status: 503 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Estás escribiendo muy rápido, espera un momento." },
        { status: 429 }
      );
    }

    const body = await req.json();

    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
      : [];

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Mensaje vacío" },
        { status: 400 }
      );
    }

    const [settings, products] = await Promise.all([
      prisma.settings.findUnique({
        where: { id: "singleton" },
      }),

      prisma.product.findMany({
        where: {
          stock: { gt: 0 },
        },
        orderBy: [
          { order: "asc" },
          { createdAt: "desc" },
        ],
        take: 80,
        select: {
          slug: true,
          name: true,
          description: true,
          features: true,
          price: true,
          promoPrice: true,
          isPromo: true,
          category: true,
          stock: true,
          images: true,
          order: true,
        },
      }),
    ]);

    const showPrices = settings?.showPrices ?? true;
    const whatsapp = settings?.whatsapp || "";
    const shippingText =
      settings?.shippingText || "Envíos a nivel nacional";
    const businessHours = settings?.businessHours || "";
    const mapsUrl = settings?.mapsUrl || "";

    const userMessages = messages.filter((m) => m.role === "user");

    const currentMessage =
      userMessages[userMessages.length - 1]?.content || "";

    const currentNormalized = normalize(currentMessage);

    const askingMore =
      currentNormalized.includes("mas opciones") ||
      currentNormalized.includes("más opciones") ||
      currentNormalized === "ver mas" ||
      currentNormalized === "ver más";

    let searchMessage = currentMessage;

    if (askingMore && userMessages.length >= 2) {
      searchMessage =
        userMessages[userMessages.length - 2]?.content || currentMessage;
    }

    const normalizedSearch = normalize(searchMessage);
    const terms = getTerms(searchMessage);

    const wantsOffers =
      normalizedSearch.includes("oferta") ||
      normalizedSearch.includes("promocion") ||
      normalizedSearch.includes("promoción");

    const scoredProducts = products
      .map((product) => {
        const name = normalize(product.name);
        const category = normalize(product.category);
        const description = normalize(product.description);
        const features = normalize(
          Array.isArray(product.features)
            ? product.features.join(" ")
            : ""
        );

        const searchable =
          `${name} ${category} ${description} ${features}`;

        let score = 0;

        if (wantsOffers && product.isPromo) {
          score += 100;
        }

        if (
          normalizedSearch &&
          name.includes(normalizedSearch)
        ) {
          score += 40;
        }

        if (
          normalizedSearch &&
          category.includes(normalizedSearch)
        ) {
          score += 30;
        }

        if (
          normalizedSearch &&
          searchable.includes(normalizedSearch)
        ) {
          score += 20;
        }

        for (const term of terms) {
          if (name.includes(term)) score += 12;
          if (category.includes(term)) score += 9;
          if (features.includes(term)) score += 5;
          if (description.includes(term)) score += 3;
        }

        return {
          product,
          score,
        };
      })
      .filter(({ product, score }) => {
        if (wantsOffers) return product.isPromo;
        return score > 0;
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.product.order - b.product.order;
      });

    const offset = askingMore ? MAX_CHAT_PRODUCTS : 0;

    const suggestedProducts = scoredProducts
      .slice(offset, offset + MAX_CHAT_PRODUCTS)
      .map(({ product }) => ({
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] || "",
        price:
          product.isPromo && product.promoPrice
            ? product.promoPrice
            : product.price,
        originalPrice:
          product.isPromo && product.promoPrice
            ? product.price
            : null,
        isPromo: product.isPromo && !!product.promoPrice,
        showPrice: showPrices,
      }));

    const catalogText = products
      .map((product) => {
        const price =
          product.isPromo && product.promoPrice
            ? product.promoPrice
            : product.price;

        return `${product.name} | categoría: ${product.category} | ${
          showPrices ? `Bs. ${price}` : "precio oculto"
        } | stock disponible`;
      })
      .join("\n");

    const systemInstruction = `Eres el asistente virtual de ventas de Bebitos, una tienda boliviana de artículos para bebés.

REGLAS:
- Responde únicamente usando información real del catálogo.
- Sé amable, natural y muy breve.
- Nunca inventes productos, precios, características o disponibilidad.
- La interfaz muestra tarjetas visuales de productos debajo de tu respuesta.
- Si existen productos relacionados, NO escribas una lista de productos.
- Si existen productos relacionados, NO repitas precios ni descripciones.
- En ese caso responde solamente una frase corta, por ejemplo:
  "Encontré estas opciones para ti 👶"
  "Mira estas opciones 😊"
  "Encontré algunos productos que podrían servirte 👶"
- Máximo 2 frases cuando haya productos.
- Si el usuario pregunta algo específico que requiere explicación, puedes responder brevemente.
- Si muestra intención de comprar, indícale que puede abrir el producto o hablar con una persona por WhatsApp.
- No uses Markdown.
- No escribas listas largas.
- No uses tablas.
- No menciones cantidades exactas de inventario.
- Envíos: ${shippingText}.
${businessHours ? `- Horario: ${businessHours}.` : ""}
${mapsUrl ? `- Ubicación: ${mapsUrl}.` : ""}
${whatsapp ? `- WhatsApp de la tienda: ${whatsapp}.` : ""}

CATÁLOGO:
${catalogText || "No hay productos disponibles."}
`;

    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
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
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 160,
            temperature: 0.35,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "");

      console.error(
        "Gemini API error:",
        geminiRes.status,
        errText
      );

      return NextResponse.json(
        {
          error:
            "No se pudo procesar tu mensaje. Intenta nuevamente.",
        },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();

    let reply: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "¿En qué puedo ayudarte?";

    reply = reply
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^[-*]\s+/gm, "")
      .trim();

    /*
      Si encontramos productos, no permitimos que Gemini
      llene la pantalla repitiendo el catálogo.
    */
    if (suggestedProducts.length > 0) {
      if (askingMore) {
        reply = "Aquí tienes otras opciones 👶";
      } else if (suggestedProducts.length === 1) {
        reply = "Encontré esta opción para ti 👶";
      } else {
        reply = "Encontré estas opciones para ti 👶";
      }
    } else if (reply.length > 240) {
      reply = reply.slice(0, 237).trim() + "...";
    }

    return NextResponse.json({
      reply,
      products: suggestedProducts,
      hasMore:
        scoredProducts.length >
        offset + suggestedProducts.length,
    });
  } catch (error) {
    console.error("Chat route error:", error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
