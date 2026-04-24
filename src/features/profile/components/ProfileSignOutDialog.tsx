import { LogOut } from "lucide-react-native";
import { ActionConfirmDialog } from "@/shared/ui";

type ProfileSignOutDialogProps = {
  isVisible: boolean;
  isSigningOut: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ProfileSignOutDialog({
  isVisible,
  isSigningOut,
  onCancel,
  onConfirm,
}: ProfileSignOutDialogProps) {
  return (
    <ActionConfirmDialog
      isVisible={isVisible}
      title="Sign out"
      message="Are you sure you want to sign out?"
      icon={<LogOut size={20} color="#E26B6B" strokeWidth={2.4} />}
      confirmLabel="Sign out"
      confirmLoadingLabel="Signing out..."
      isConfirming={isSigningOut}
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmTone="danger"
    />
  );
}
