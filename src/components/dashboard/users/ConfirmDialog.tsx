import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  type: "block" | "delete" | null;
  isBlocked?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  type,
  isBlocked = false,
  isLoading = false,
}: ConfirmDialogProps) {
  const getTitle = () => {
    if (type === "delete") return "Delete User";
    if (type === "block" && isBlocked) return "Unblock User";
    return "Block User";
  };

  const getDescription = () => {
    if (type === "delete") {
      return "Are you sure you want to delete this user? This action cannot be undone.";
    }
    if (type === "block" && isBlocked) {
      return "Unblock this user? They will be able to access the platform again.";
    }
    return "Block this user? This will prevent them from accessing the platform.";
  };

  const getActionLabel = () => {
    if (isLoading) return "Processing...";
    if (type === "delete") return "Delete";
    if (type === "block" && isBlocked) return "Unblock";
    return "Block";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={type === "delete" ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {getActionLabel()}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
