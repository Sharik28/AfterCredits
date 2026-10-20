import { NextRequest, NextResponse } from "next/server";
import { searchShows } from "@/lib/tmdb/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  const results = await searchShows(query);
  return NextResponse.json({ results });
}
