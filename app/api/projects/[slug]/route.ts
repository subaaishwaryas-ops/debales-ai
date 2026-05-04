import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/db";
import { assertProjectAccess } from "@/lib/access";
import { getProjectBySlug, getProductInstanceByProject } from "@/lib/services";
import { handleError } from "@/lib/api-error";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await requireSession();
    const project = await getProjectBySlug(slug);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertProjectAccess(session, String(project._id));
    const instance = await getProductInstanceByProject(String(project._id));
    return NextResponse.json({ project, instance });
  } catch (e: any) { return handleError(e); }
}
