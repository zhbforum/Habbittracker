import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import type { ProfileFormValues } from "../model/types";
import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";
import { ProfileEditAvatarSection } from "./ProfileEditAvatarSection";
import { ProfileEditFields } from "./ProfileEditFields";

type ProfileEditSheetProps = {
  isVisible: boolean;
  values: ProfileFormValues;
  pendingAvatarUri: string | null;
  isSaving: boolean;
  isPickingAvatar: boolean;
  canChangeUsername: boolean;
  usernameChangeHint: string;
  onFieldChange: <K extends keyof ProfileFormValues>(
    field: K,
    value: ProfileFormValues[K],
  ) => void;
  onPickAvatar: () => void;
  onResetAvatar: () => void;
  onSave: () => void;
  onClose: () => void;
};

export function ProfileEditSheet({
  isVisible,
  values,
  pendingAvatarUri,
  isSaving,
  isPickingAvatar,
  canChangeUsername,
  usernameChangeHint,
  onFieldChange,
  onPickAvatar,
  onResetAvatar,
  onSave,
  onClose,
}: ProfileEditSheetProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const avatarPreviewUrl = pendingAvatarUri || values.avatarUrl || null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetContainer}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <AppText style={styles.title}>Edit Profile</AppText>

            <ScrollView
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <ProfileEditAvatarSection
                seed={values.username || values.name || "profile"}
                avatarPreviewUrl={avatarPreviewUrl}
                pendingAvatarUri={pendingAvatarUri}
                isSaving={isSaving}
                isPickingAvatar={isPickingAvatar}
                onPickAvatar={onPickAvatar}
                onResetAvatar={onResetAvatar}
              />

              <ProfileEditFields
                values={values}
                canChangeUsername={canChangeUsername}
                usernameChangeHint={usernameChangeHint}
                onFieldChange={onFieldChange}
              />
            </ScrollView>

            <View style={styles.actionsRow}>
              <Pressable style={styles.secondaryButton} onPress={onClose}>
                <AppText style={styles.secondaryButtonText}>Cancel</AppText>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
                onPress={onSave}
                disabled={isSaving}
              >
                <AppText style={styles.primaryButtonText}>
                  {isSaving ? "Saving..." : "Save"}
                </AppText>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(8, 14, 28, 0.42)",
    },
    sheetContainer: {
      width: "100%",
    },
    sheet: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 18,
      paddingBottom: 18,
      maxHeight: "90%",
    },
    handle: {
      width: 48,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginTop: 10,
      marginBottom: 12,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    formContent: {
      paddingTop: 14,
      gap: 14,
      paddingBottom: 8,
    },
    actionsRow: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    primaryButton: {
      flex: 1,
      minHeight: 50,
      borderRadius: 12,
      backgroundColor: colors.accentPrimary,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 22,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 50,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
}
