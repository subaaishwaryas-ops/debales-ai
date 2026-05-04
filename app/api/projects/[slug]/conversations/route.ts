import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/db";
import { assertProjectAccess } from "@/lib/access";
import { getProjectBySlug, getConversationsByUser, createConversation } from "@/lib/services";
import { CreateConversationSchema } from "@/lib/schemas";
import { handleError } from "@/lib/api-error";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await requireSession();
    const project = await getProjectBySlug(slug);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertProjectAccess(session, String(project._id));
    const convos = await getConversationsByUser(session.userId, String(project._id));
    return NextResponse.json(convos);
  } catch (e: any) { return handleError(e); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await requireSession();
    const project = await getProjectBySlug(slug);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertProjectAccess(session, String(project._id));
    const body = CreateConversationSchema.parse(await req.json());
    const convo = await createConversation(session.userId, String(project._id), body.productInstanceId, body.title);
    return NextResponse.json(convo, { status: 201 });
  } catch (e: any) { return handleError(e); }
}
