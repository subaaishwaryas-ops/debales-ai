import { NextResponse } from "next/server";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(e: any) {
  console.error(e);
  return apiError(e.message ?? "Internal server error", e.status ?? 500);
}
