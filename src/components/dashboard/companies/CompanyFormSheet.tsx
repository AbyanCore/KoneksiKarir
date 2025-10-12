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

interface CompanyFormData {
  name: string;
  description: string;
  website: string;
  location: string;
  logoUrl: string;
  code: string;
}

interface CompanyFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CompanyFormData;
  onFormDataChange: (data: CompanyFormData) => void;
  onSubmit: () => void;
  onGenerateCode: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export default function CompanyFormSheet({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  onGenerateCode,
  isLoading = false,
  mode,
}: CompanyFormSheetProps) {
  const isFormValid =
    formData.name &&
    formData.code &&
    formData.code.length === 6 &&
    formData.description &&
    formData.location;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add New Company" : "Edit Company"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Register a new company to the system"
              : "Update company information"}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-3 p-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm">
              Company Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Tech Corp Indonesia"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="code" className="text-sm">
              Secret Company Code (6 characters)
            </Label>
            <div className="flex gap-2">
              <Input
                id="code"
                type="password"
                placeholder="••••••"
                value={formData.code}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                maxLength={6}
                className="flex-1 font-mono tracking-widest"
              />
              <Button
                type="button"
                variant="outline"
                onClick={onGenerateCode}
                className="shrink-0"
              >
                Generate
              </Button>
            </div>
            {formData.code && (
              <p className="text-xs text-slate-500 mt-1">
                Code:{" "}
                <span className="font-mono font-semibold">{formData.code}</span>
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the company..."
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
              <Label htmlFor="website" className="text-sm">
                Website
              </Label>
              <Input
                id="website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) =>
                  onFormDataChange({ ...formData, website: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location" className="text-sm">
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Jakarta, Indonesia"
                value={formData.location}
                onChange={(e) =>
                  onFormDataChange({ ...formData, location: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="logoUrl" className="text-sm">
              Logo URL
            </Label>
            <Input
              id="logoUrl"
              placeholder="/logos/company.png"
              value={formData.logoUrl}
              onChange={(e) =>
                onFormDataChange({ ...formData, logoUrl: e.target.value })
              }
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
              ? "Add Company"
              : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
