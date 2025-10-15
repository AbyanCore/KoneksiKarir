import { NextRequest, NextResponse } from "next/server";
import { createReadStream, Stats } from "fs";
import { stat } from "fs/promises";
import { join } from "path";
import prisma from "@/lib/prisma";

const DATA_DIR = join(process.cwd(), "data");

function getCASPath(hash: string): string {
  const level1 = hash.substring(0, 2);
  const level2 = hash.substring(2, 4);
  return join(DATA_DIR, level1, level2, hash);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;

    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      return NextResponse.json(
        { error: "Invalid content hash format" },
        { status: 400 }
      );
    }

    const metadata = await prisma.storedFile.findUnique({
      where: { contentHash: hash },
    });

    if (!metadata) {
      return NextResponse.json(
        { error: "File metadata not found" },
        { status: 404 }
      );
    }

    const filePath = getCASPath(hash);

    let stats: Stats;
    try {
      stats = await stat(filePath);
    } catch {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 }
      );
    }

    const fileStream = createReadStream(filePath);
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": metadata.mimeType,
        "Content-Disposition": `inline; filename="${metadata.originalFilename}"`,
        "Content-Length": stats.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: hash,
      },
    });
  } catch (error) {
    console.error("❌ [File Read Error]:", error);
    return NextResponse.json(
      { error: "Internal server error during file retrieval" },
      { status: 500 }
    );
  }
}
