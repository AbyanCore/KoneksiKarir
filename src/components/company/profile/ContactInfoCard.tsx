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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Image } from "lucide-react";
import FileUpload, { FileUploadResponse } from "@/components/ui/file-upload";

interface ContactInfoCardProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export default function ContactInfoCard({
  form,
  isEditing,
}: ContactInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Contact & Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={!isEditing}
                  type="url"
                  placeholder="https://www.example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Company Logo
                </div>
              </FormLabel>
              <FormControl>
                <div
                  className="space-y-4"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {isEditing ? (
                    <div onSubmit={(e) => e.preventDefault()}>
                      <FileUpload
                        accept="image/*"
                        maxSize={5}
                        label="Upload Company Logo"
                        description="PNG, JPG, GIF up to 5MB"
                        currentFileUrl={field.value || undefined}
                        showPreview={true}
                        disabled={!isEditing}
                        onUploadSuccess={(data: FileUploadResponse) => {
                          field.onChange(data.url);
                        }}
                        onUploadError={(error) => {
                          console.error("Logo upload error:", error);
                        }}
                      />
                    </div>
                  ) : (
                    field.value && (
                      <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                        <img
                          src={field.value}
                          alt="Company Logo"
                          className="max-h-32 max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload your company logo (max 5MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
