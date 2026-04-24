import { Image, Pressable, StyleSheet, View } from "react-native";
import { Pencil } from "lucide-react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";

import { BlockAvatar } from "./BlockAvatar";

type ProfileAvatarProps = {
  seed: string;
  avatarUrl: string | null;
  size?: number;
  editable?: boolean;
  onPress?: () => void;
};

export function ProfileAvatar({
  seed,
  avatarUrl,
  size = 112,
  editable = false,
  onPress,
}: ProfileAvatarProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors, size);
  const content = avatarUrl ? (
    <Image source={{ uri: avatarUrl }} style={styles.image} />
  ) : (
    <BlockAvatar seed={seed} size={size} />
  );

  if (editable) {
    return (
      <Pressable style={styles.editableContainer} onPress={onPress}>
        {content}
        <View style={styles.editBadge}>
          <Pencil size={14} color={colors.textPrimary} strokeWidth={2.2} />
        </View>
      </Pressable>
    );
  }

  return <View style={styles.readOnlyContainer}>{content}</View>;
}

function createStyles(colors: ThemeColors, size: number) {
  return StyleSheet.create({
    readOnlyContainer: {
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.28),
      borderWidth: 1.5,
      borderColor: colors.border,
      overflow: "hidden",
    },
    editableContainer: {
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.28),
      borderWidth: 1.5,
      borderColor: colors.border,
      overflow: "visible",
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: Math.round(size * 0.28),
      backgroundColor: colors.surfaceSecondary,
    },
    editBadge: {
      position: "absolute",
      right: -2,
      bottom: -2,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.accentPrimary,
      borderWidth: 1,
      borderColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}

