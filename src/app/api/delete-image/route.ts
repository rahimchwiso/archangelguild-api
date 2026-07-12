import { type NextRequest, NextResponse } from "next/server";
import { deleteFromDrive, extractFileId } from "@/lib/google-drive";
import { verifyUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    const { role } = await verifyUser(request);
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403, headers: corsHeaders }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400, headers: corsHeaders });
    }

    const fileId = extractFileId(url);
    if (!fileId) {
      return NextResponse.json(
        { success: true, message: "Not a Google Drive URL, skipped deletion" },
        { status: 200, headers: corsHeaders }
      );
    }

    await deleteFromDrive(fileId);

    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error("Delete Image API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete image from Google Drive" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
