import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface ProfileActionsProps {
  isEditing: boolean;
  isSubmitting: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

export default function ProfileActions({
  isEditing,
  isSubmitting,
  onEdit,
  onCancel,
}: ProfileActionsProps) {
  if (!isEditing) {
    return (
      <Button
        type="button"
        onClick={onEdit}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        Edit Profile
      </Button>
    );
  }

  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        type="submit"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        disabled={isSubmitting}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
