import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Company {
  id: number;
  name: string;
  location: string | null;
}

interface DeleteConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmSheet({
  open,
  onOpenChange,
  company,
  onConfirm,
  isLoading = false,
}: DeleteConfirmSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Delete Company</SheetTitle>
          <SheetDescription>
            Are you sure you want to delete this company? This action cannot be
            undone.
          </SheetDescription>
        </SheetHeader>

        {company && (
          <div className="p-4">
            <p className="font-semibold text-sm">{company.name}</p>
            <p className="text-sm text-slate-600 mt-1">{company.location}</p>
          </div>
        )}

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Deleting..." : "Delete Company"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
