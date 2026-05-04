import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/services";
import { handleError } from "@/lib/api-error";

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      project: (u.projectId as any)?.name ?? "",
      projectSlug: (u.projectId as any)?.slug ?? "",
    })));
  } catch (e: any) { return handleError(e); }
}
