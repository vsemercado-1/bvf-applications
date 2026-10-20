import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

// Headshot upload. Stores the image in Vercel Blob and returns its public URL.
// If Blob isn't configured (no BLOB_READ_WRITE_TOKEN), returns 501 and the
// form keeps a local preview only.
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Uploads not configured" }, { status: 501 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Images only" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Max 4 MB" }, { status: 400 });

  const ext = file.type === "image/png" ? "png" : "jpg";
  const blob = await put(`headshots/${crypto.randomUUID()}.${ext}`, file, {
    access: "public",
    contentType: file.type,
  });
  return NextResponse.json({ url: blob.url });
}
