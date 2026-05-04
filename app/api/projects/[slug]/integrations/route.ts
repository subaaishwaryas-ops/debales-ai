import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/db";
import { assertProjectAccess, assertAdmin } from "@/lib/access";
import { getProjectBySlug, toggleIntegration } from "@/lib/services";
import { ToggleIntegrationSchema } from "@/lib/schemas";
import { handleError } from "@/lib/api-error";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await requireSession();
    const project = await getProjectBySlug(slug);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertProjectAccess(session, String(project._id));
    assertAdmin(session);
    const body = ToggleIntegrationSchema.parse(await req.json());
    const updated = await toggleIntegration(String(project._id), body.integration, body.enabled);
    return NextResponse.json(updated);
  } catch (e: any) { return handleError(e); }
}
