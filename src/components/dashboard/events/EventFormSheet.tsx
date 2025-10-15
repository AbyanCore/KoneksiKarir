"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FileUpload, { FileUploadResponse } from "@/components/ui/file-upload";

interface EventFormData {
  title: string;
  description: string;
  bannerUrl: string;
  minimapUrl: string;
  date: string;
  location: string;
}

interface EventFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: EventFormData;
  onFormDataChange: (data: EventFormData) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export default function EventFormSheet({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading = false,
  mode,
}: EventFormSheetProps) {
  const isFormValid =
    formData.title &&
    formData.description &&
    formData.date &&
    formData.location;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create New Event" : "Edit Event"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new career fair event to the system"
              : "Update event information"}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-3 p-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm">
              Event Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Tech Career Fair 2024"
              value={formData.title}
              onChange={(e) =>
                onFormDataChange({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the event..."
              rows={2}
              className="text-sm"
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-sm">
                Event Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  onFormDataChange({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="text-sm">
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Jakarta Convention Center"
                value={formData.location}
                onChange={(e) =>
                  onFormDataChange({ ...formData, location: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bannerUrl" className="text-sm">
              Event Banner
            </Label>
            <FileUpload
              accept="image/*"
              maxSize={10}
              label="Upload Event Banner"
              description="Upload banner image (1920x1080 recommended, max 10MB)"
              currentFileUrl={formData.bannerUrl || undefined}
              showPreview={true}
              onUploadSuccess={(data: FileUploadResponse) => {
                onFormDataChange({ ...formData, bannerUrl: data.url });
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="minimapUrl" className="text-sm">
              Event Minimap
            </Label>
            <FileUpload
              accept="image/*"
              maxSize={5}
              label="Upload Event Minimap"
              description="Upload minimap image (max 5MB)"
              currentFileUrl={formData.minimapUrl || undefined}
              showPreview={true}
              onUploadSuccess={(data: FileUploadResponse) => {
                onFormDataChange({ ...formData, minimapUrl: data.url });
              }}
            />
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!isFormValid || isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {isLoading
              ? "Processing..."
              : mode === "create"
              ? "Create Event"
              : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
