import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/lib/schemas";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { handleError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const { userId } = LoginSchema.parse(await req.json());
    await connectDB();
    const user = await User.findById(userId).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const res = NextResponse.json({ ok: true, user: { id: String(user._id), name: user.name, email: user.email, role: user.role } });
    res.cookies.set("userId", userId, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e: any) { return handleError(e); }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("userId");
  return res;
}
