import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  contactEmail: z.string().email(),
  firstName: z.string().optional(),
  items: z.array(
    z.object({
      title: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    }),
  ),
  checkoutUrl: z.string().url(),
});

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-n8n-secret");
  if (!secret || secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }
  const { contactEmail, firstName, items, checkoutUrl } = parsed.data;
  const lines = items
    .map(
      (i) =>
        `<li>${i.title} × ${i.quantity} — ${(i.unitPrice * i.quantity).toFixed(2)} €</li>`,
    )
    .join("");

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Tu es Victoria, assistante Tekach. Rédige un email court en français pour relancer un panier abandonné. Ton premium, chaleureux, sans promesse de remise sauf si fournie. Inclus le lien checkout fourni. HTML simple : p, ul, a.",
            },
            {
              role: "user",
              content: `Client: ${firstName ?? ""} (${contactEmail}). Articles: ${lines}. Lien: ${checkoutUrl}`,
            },
          ],
          temperature: 0.4,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const html = data.choices?.[0]?.message?.content ?? "";
        return NextResponse.json({
          subject: "Votre panier Tekach vous attend",
          html,
          source: "openai",
        });
      }
    } catch {
      /* fallback template */
    }
  }

  const html = `
    <p>Bonjour${firstName ? ` ${firstName}` : ""},</p>
    <p>Vous avez laissé des articles dans votre panier Tekach :</p>
    <ul>${lines}</ul>
    <p><a href="${checkoutUrl}">Reprendre le paiement en sécurité</a></p>
    <p>— Victoria, Tekach</p>
  `;
  return NextResponse.json({
    subject: "Finalisez votre commande Tekach",
    html,
    source: "template",
  });
}
