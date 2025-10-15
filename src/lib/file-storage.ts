/**
 * File Storage Utilities for CAS (Content-Addressable Storage)
 */

export interface FileUploadResponse {
  success: boolean;
  message: string;
  contentHash: string;
  size: number;
  mimeType: string;
  originalName: string;
  url: string;
}

/**
 * Upload a file to CAS storage
 */
export async function uploadFile(file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/file/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}

/**
 * Get file URL from content hash
 */
export function getFileUrl(contentHash: string): string {
  return `/api/file/read/${contentHash}`;
}

/**
 * Extract content hash from URL
 */
export function extractContentHash(url: string): string | null {
  const match = url.match(/\/api\/file\/read\/([a-f0-9]{64})/i);
  return match ? match[1] : null;
}

/**
 * Check if URL is a CAS URL
 */
export function isCASUrl(url: string): boolean {
  return /\/api\/file\/read\/[a-f0-9]{64}/i.test(url);
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in MB
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10, allowedTypes } = options;

  // Check size
  if (file.size > maxSize * 1024 * 1024) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize}MB limit`,
    };
  }

  // Check type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
}
