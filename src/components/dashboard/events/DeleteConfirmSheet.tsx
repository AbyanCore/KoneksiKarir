import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Event {
  id: number;
  title: string;
  location: string | null;
  date: Date | string;
}

interface DeleteConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmSheet({
  open,
  onOpenChange,
  event,
  onConfirm,
  isLoading = false,
}: DeleteConfirmSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Delete Event</SheetTitle>
          <SheetDescription>
            Are you sure you want to delete this event? This action cannot be
            undone.
          </SheetDescription>
        </SheetHeader>

        {event && (
          <div className="p-4">
            <p className="font-semibold text-sm">{event.title}</p>
            <p className="text-sm text-slate-600 mt-1">
              {event.location} • {new Date(event.date).toLocaleDateString()}
            </p>
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
            {isLoading ? "Deleting..." : "Delete Event"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
