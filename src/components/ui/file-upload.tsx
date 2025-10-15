"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
  Upload,
  X,
  FileIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onUploadSuccess: (data: FileUploadResponse) => void;
  onUploadError?: (error: string) => void;
  label?: string;
  description?: string;
  currentFileUrl?: string;
  showPreview?: boolean;
  disabled?: boolean;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  contentHash: string;
  size: number;
  mimeType: string;
  originalName: string;
  url: string;
}

export default function FileUpload({
  accept = "image/*,.pdf,.doc,.docx",
  maxSize = 10,
  onUploadSuccess,
  onUploadError,
  label = "Upload File",
  description = "Click to upload or drag and drop",
  currentFileUrl,
  showPreview = true,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSize}MB limit`);
      if (onUploadError) onUploadError(`File size exceeds ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    setUploadStatus("idle");

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setUploadStatus("idle");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Simulate progress (since fetch doesn't support upload progress natively)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/file/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies for auth
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadStatus("success");
      toast.success(data.message || "File uploaded successfully!");
      onUploadSuccess(data);

      // Clear selection after success
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setProgress(0);
      }, 2000);
    } catch (error) {
      setUploadStatus("error");
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      toast.error(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setUploadStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload Button / Dropzone */}
      {!selectedFile && !currentFileUrl && (
        <Card
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary"
          }`}
          onClick={!disabled ? handleButtonClick : undefined}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm font-medium mb-1">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
          <p className="text-xs text-gray-400 mt-2">Max size: {maxSize}MB</p>
        </Card>
      )}

      {/* Current File Display */}
      {!selectedFile && currentFileUrl && showPreview && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Current File</p>
                <a
                  href={currentFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View File
                </a>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={disabled}
              type="button"
            >
              Change
            </Button>
          </div>
        </Card>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <Card className="p-4">
          <div className="space-y-4">
            {/* Preview */}
            {previewUrl && showPreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <FileIcon className="h-12 w-12 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-gray-500">{progress}%</p>
              </div>
            )}

            {/* Status Messages */}
            {uploadStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Upload successful!</span>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Upload failed. Please try again.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!uploading && uploadStatus !== "success" && (
                <>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
