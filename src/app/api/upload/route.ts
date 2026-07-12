import { type NextRequest, NextResponse } from "next/server";
import { uploadToDrive } from "@/lib/google-drive";
import { verifyUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Allow requests from Cloudflare Pages site
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    "https://archangelguild.pages.dev",
    "https://archangelsguild.com",
    "http://localhost:3000",
  ];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { role } = await verifyUser(request);
    if (role === "guest") {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to upload files" },
        { status: 401, headers: corsHeaders }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400, headers: corsHeaders });
    }

    if (!file.type.match("image/.*")) {
      return NextResponse.json(
        { error: "Only image files are allowed (JPG, PNG, WEBP)" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 15MB" },
        { status: 400, headers: corsHeaders }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const category = formData.get("category") as string | null;

    const { publicUrl } = await uploadToDrive(buffer, file.name, file.type, category);

    return NextResponse.json({ url: publicUrl }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
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
