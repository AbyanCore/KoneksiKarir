import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { webcrypto } from "crypto";
import prisma from "@/lib/prisma";

// Use webcrypto for modern, platform-agnostic crypto
const { subtle } = webcrypto;

const DATA_DIR = join(process.cwd(), "data");
const METADATA_PATH = join(DATA_DIR, "metadata.json");

interface FileMetadata {
  mimeType: string;
  originalFilename: string;
  size: number;
}

// Helper to ensure the 2-level directory exists before writing
async function ensureDir(path: string) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

// Function to read the metadata file safely
async function readMetadata(): Promise<Record<string, FileMetadata>> {
  try {
    const content = await readFile(METADATA_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // If the file doesn't exist or is invalid JSON, start with an empty object
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Read file content into a buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 2. Calculate SHA-256 hash of the file content
    const hashBuffer = await subtle.digest("SHA-256", fileBuffer);
    const hash = Buffer.from(hashBuffer).toString("hex");

    // 3. Create the CAS path
    const level1 = hash.substring(0, 2);
    const level2 = hash.substring(2, 4);
    const dirPath = join(DATA_DIR, level1, level2);
    const filePath = join(dirPath, hash);

    // 4. Save the file if it doesn't already exist
    if (!existsSync(filePath)) {
      await ensureDir(dirPath);
      await writeFile(filePath, fileBuffer);
      console.log(`✅ File saved: ${filePath}`);
    } else {
      console.log(`ℹ️ File with hash ${hash} already exists. Skipping save.`);
    }

    // 5. Update the metadata file
    const allMetadata = await readMetadata();

    if (!allMetadata[hash]) {
      allMetadata[hash] = {
        mimeType: file.type || "application/octet-stream",
        originalFilename: file.name,
        size: file.size,
      };
      await writeFile(METADATA_PATH, JSON.stringify(allMetadata, null, 2));
      console.log(`📝 Metadata updated for hash: ${hash}`);
    }

    await prisma.storedFile.upsert({
      where: { contentHash: hash },
      update: {
        mimeType: file.type || "application/octet-stream",
        originalFilename: file.name,
        size: file.size,
      },
      create: {
        contentHash: hash,
        mimeType: file.type || "application/octet-stream",
        originalFilename: file.name,
        size: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      contentHash: hash,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      originalName: file.name,
      url: `/api/file/read/${hash}`,
    });
  } catch (error) {
    console.error("❌ [File Upload Error]:", error);
    return NextResponse.json(
      { error: "Internal server error during file upload" },
      { status: 500 }
    );
  }
}
