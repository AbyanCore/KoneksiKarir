"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import FileUpload, { FileUploadResponse } from "@/components/ui/file-upload";

interface DocumentsCardProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export default function DocumentsCard({ form, isEditing }: DocumentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="resumeUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume / CV</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {isEditing ? (
                    <FileUpload
                      accept=".pdf,.doc,.docx"
                      maxSize={5}
                      label="Upload Resume/CV"
                      description="PDF, DOC, DOCX up to 5MB"
                      currentFileUrl={field.value || undefined}
                      showPreview={true}
                      disabled={!isEditing}
                      onUploadSuccess={(data: FileUploadResponse) => {
                        field.onChange(data.url);
                      }}
                      onUploadError={(error) => {
                        console.error("Resume upload error:", error);
                      }}
                    />
                  ) : (
                    field.value && (
                      <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <a
                          href={field.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Resume
                        </a>
                      </div>
                    )
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload your resume or CV (max 5MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portfolioUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {isEditing ? (
                    <FileUpload
                      accept=".pdf,.doc,.docx"
                      maxSize={10}
                      label="Upload Portfolio"
                      description="PDF, DOC, DOCX up to 10MB"
                      currentFileUrl={field.value || undefined}
                      showPreview={true}
                      disabled={!isEditing}
                      onUploadSuccess={(data: FileUploadResponse) => {
                        field.onChange(data.url);
                      }}
                      onUploadError={(error) => {
                        console.error("Portfolio upload error:", error);
                      }}
                    />
                  ) : (
                    field.value && (
                      <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <a
                          href={field.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Portfolio
                        </a>
                      </div>
                    )
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload your portfolio document (max 10MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
