"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Image } from "lucide-react";

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
                  Company Logo URL
                </div>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={!isEditing}
                  type="url"
                  placeholder="https://example.com/logo.png"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("logoUrl") && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Logo Preview:</p>
            <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
              <img
                src={form.watch("logoUrl")}
                alt="Company Logo"
                className="max-h-32 max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
