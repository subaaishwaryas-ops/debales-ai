import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/db";
import { assertProjectAccess } from "@/lib/access";
import { getConversationById, getMessagesByConversation, saveMessage, getProductInstanceByProject } from "@/lib/services";
import { callAI, buildSteps } from "@/lib/services/ai";
import { SendMessageSchema } from "@/lib/schemas";
import { handleError } from "@/lib/api-error";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireSession();
    const convo = await getConversationById(id);
    if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertProjectAccess(session, String(convo.projectId));
    const messages = await getMessagesByConversation(id);
    return NextResponse.json(messages);
  } catch (e: any) { return handleError(e); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireSession();
    const body = SendMessageSchema.parse(await req.json());
    const convo = await getConversationById(id);
    if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertProjectAccess(session, String(convo.projectId));

    await saveMessage(id, "user", body.content);

    const instance = await getProductInstanceByProject(String(convo.projectId));
    const integrations = instance?.integrations ?? { shopify: false, crm: false };
    const steps = buildSteps(integrations);

    const history = await getMessagesByConversation(id);
    const aiMessages = history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    const aiContent = await callAI(aiMessages, integrations);

    const assistantMsg = await saveMessage(id, "assistant", aiContent, steps);
    return NextResponse.json({ message: assistantMsg, steps });
  } catch (e: any) { return handleError(e); }
}
