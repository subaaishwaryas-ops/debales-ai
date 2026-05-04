import mongoose from "mongoose";
import { cookies } from "next/headers";
import { User } from "./models";
import type { SessionUser } from "./access";
import { UnauthorizedError } from "./access";

const MONGODB_URI = process.env.MONGODB_URI!;
let cached = (global as any).__mongoose as { conn: any; promise: any } | undefined;
if (!cached) cached = (global as any).__mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) cached!.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  await connectDB();
  const user = await User.findById(userId).lean();
  if (!user) return null;
  return { userId: String(user._id), projectId: String(user.projectId), role: user.role };
}

export async function requireSession(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) throw new UnauthorizedError();
  return s;
}
