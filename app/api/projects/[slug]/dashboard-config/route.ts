import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/db";
import { assertProjectAccess, assertAdmin } from "@/lib/access";
import { getProjectBySlug, getDashboardConfig, getDashboardStats, getRecentConversations, getUsersByProject, getProductInstanceByProject } from "@/lib/services";
import { handleError } from "@/lib/api-error";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await requireSession();
    const project = await getProjectBySlug(slug);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertProjectAccess(session, String(project._id));
    assertAdmin(session); // 403 if not admin
    const [config, stats, recentConvos, users, instance] = await Promise.all([
      getDashboardConfig(slug),
      getDashboardStats(String(project._id)),
      getRecentConversations(String(project._id)),
      getUsersByProject(String(project._id)),
      getProductInstanceByProject(String(project._id)),
    ]);
    return NextResponse.json({ config, stats, recentConvos, users, integrations: instance?.integrations ?? { shopify: false, crm: false } });
  } catch (e: any) { return handleError(e); }
}
