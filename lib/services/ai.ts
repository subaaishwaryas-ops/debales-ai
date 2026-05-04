const MOCK_SHOPIFY = `[Shopify Integration Active]\nRecent orders:\n- Order #1042: 2x "Classic Tee" ($58) - Shipped\n- Order #1041: 1x "Winter Jacket" ($129) - Processing\nCustomer LTV: $487`;
const MOCK_CRM = `[CRM Integration Active]\nContact: John Doe (john@example.com)\nDeal stage: Negotiation\nNotes: Interested in bulk pricing for Q4`;

function buildSystem(integrations: { shopify: boolean; crm: boolean }) {
  let p = "You are a helpful AI sales assistant. Be concise and professional.";
  if (integrations.shopify) p += `\n\n${MOCK_SHOPIFY}`;
  if (integrations.crm) p += `\n\n${MOCK_CRM}`;
  return p;
}

export function buildSteps(integrations: { shopify: boolean; crm: boolean }): string[] {
  const steps = ["Analyzing your message..."];
  if (integrations.shopify) steps.push("Fetching Shopify order data...");
  if (integrations.crm) steps.push("Querying CRM contact info...");
  steps.push("Generating response...");
  return steps;
}

export async function callAI(messages: { role: "user" | "assistant"; content: string }[], integrations: { shopify: boolean; crm: boolean }): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return fallback();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000", "X-Title": "Debales AI" },
      body: JSON.stringify({ model: "google/gemini-2.0-flash-exp:free", messages: [{ role: "system", content: buildSystem(integrations) }, ...messages.slice(-10)], max_tokens: 512 }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 429) { console.warn("[AI] Rate limited"); return fallback(); }
    if (!res.ok) { console.error("[AI] Error", res.status); return fallback(); }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? fallback();
  } catch (e) { console.error("[AI]", e); return fallback(); }
}

function fallback() { return "I'm here to help! (AI unavailable — check your OPENROUTER_API_KEY or rate limits.)"; }
