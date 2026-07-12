import { type NextRequest, NextResponse } from "next/server";
import { listDriveFiles, deleteFromDrive } from "@/lib/google-drive";
import { verifyUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    const data = await listDriveFiles();
    return NextResponse.json(data, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error("Fetch media list API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch media library" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "No fileId provided" }, { status: 400, headers: corsHeaders });
    }

    await deleteFromDrive(fileId);
    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error("Delete media API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file from Google Drive" },
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
