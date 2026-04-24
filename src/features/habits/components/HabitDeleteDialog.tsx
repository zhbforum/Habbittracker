import { Trash2 } from "lucide-react-native";

import { ActionConfirmDialog } from "@/shared/ui";

type HabitDeleteDialogProps = {
  isVisible: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function HabitDeleteDialog({
  isVisible,
  isDeleting,
  onCancel,
  onConfirm,
}: HabitDeleteDialogProps) {
  return (
    <ActionConfirmDialog
      isVisible={isVisible}
      title="Delete habit"
      message="This habit and all activity history will be removed."
      icon={<Trash2 size={20} color="#E26B6B" strokeWidth={2.4} />}
      confirmLabel="Delete"
      confirmLoadingLabel="Deleting..."
      isConfirming={isDeleting}
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmTone="danger"
    />
  );
}
