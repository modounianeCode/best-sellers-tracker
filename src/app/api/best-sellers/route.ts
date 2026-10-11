import { NextResponse } from "next/server";
import { fetchAllBestSellers, saveResult } from "@/lib/store";

export async function GET() {
  const result = await fetchAllBestSellers();
  await saveResult(result);
  return NextResponse.json(result);
}
