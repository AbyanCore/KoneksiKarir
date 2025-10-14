"use client";

import { Button } from "@/components/ui/button";
import { Save, X, Edit2 } from "lucide-react";

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
  return (
    <div className="flex justify-end gap-3">
      {isEditing ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </>
      ) : (
        <Button type="button" onClick={onEdit}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      )}
    </div>
  );
}
