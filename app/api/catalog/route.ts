import { NextResponse } from "next/server";
import { fetchCatalog } from "@/lib/catalog";

export async function GET() {
  const data = await fetchCatalog();
  return NextResponse.json(data);
}
