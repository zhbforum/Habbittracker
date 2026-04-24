import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { ProfileAvatar } from "./ProfileAvatar";

type ProfileEditAvatarSectionProps = {
  seed: string;
  avatarPreviewUrl: string | null;
  pendingAvatarUri: string | null;
  isSaving: boolean;
  isPickingAvatar: boolean;
  onPickAvatar: () => void;
  onResetAvatar: () => void;
};

export function ProfileEditAvatarSection({
  seed,
  avatarPreviewUrl,
  pendingAvatarUri,
  isSaving,
  isPickingAvatar,
  onPickAvatar,
  onResetAvatar,
}: ProfileEditAvatarSectionProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.avatarSection}>
      <ProfileAvatar seed={seed} avatarUrl={avatarPreviewUrl} size={92} />

      <View style={styles.avatarActions}>
        <Pressable
          style={styles.avatarButton}
          onPress={onPickAvatar}
          disabled={isSaving || isPickingAvatar}
        >
          <AppText style={styles.avatarButtonText}>
            {isPickingAvatar ? "Opening..." : "Choose from gallery"}
          </AppText>
        </Pressable>

        {(avatarPreviewUrl || pendingAvatarUri) ? (
          <Pressable
            style={styles.avatarSecondaryButton}
            onPress={onResetAvatar}
            disabled={isSaving || isPickingAvatar}
          >
            <AppText style={styles.avatarSecondaryButtonText}>
              Use generated avatar
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    avatarSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatarActions: {
      flex: 1,
      gap: 8,
    },
    avatarButton: {
      minHeight: 42,
      borderRadius: 10,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    avatarButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
    },
    avatarSecondaryButton: {
      minHeight: 42,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    avatarSecondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
  });
}
