import { PencilLine } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import type { UserProfile, UserStats } from "../model/types";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileStatCard } from "./ProfileStatCard";

type UserProfileDetailsSectionProps = {
  profile: UserProfile;
  profileSeed: string;
  usernameLabel: string;
  publicProfilePath: string;
  stats: UserStats;
  onOpenEdit: () => void;
};

export function UserProfileDetailsSection({
  profile,
  profileSeed,
  usernameLabel,
  publicProfilePath,
  stats,
  onOpenEdit,
}: UserProfileDetailsSectionProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileTop}>
        <ProfileAvatar seed={profileSeed} avatarUrl={profile.avatarUrl} editable onPress={onOpenEdit} />

        <View style={styles.profileIdentity}>
          <AppText style={styles.displayName}>{profile.name}</AppText>
          <AppText style={styles.username}>{usernameLabel}</AppText>
          <AppText style={styles.profilePath}>{publicProfilePath}</AppText>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.secondaryActionButton} onPress={onOpenEdit}>
          <PencilLine size={17} color={colors.textSecondary} strokeWidth={2.2} />
          <AppText style={styles.secondaryActionText}>Edit profile</AppText>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <ProfileStatCard label="Total habits" value={String(stats.totalHabits)} />
        <ProfileStatCard
          label="Current streak"
          value={`${stats.currentStreak}d`}
          showFlame={stats.currentStreak >= 1}
        />
      </View>

      <View style={styles.bioBlock}>
        <AppText style={styles.bioTitle}>Bio</AppText>
        <AppText style={styles.bioText}>
          {profile.bio || "No bio yet. Add a short intro to personalize your page."}
        </AppText>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    profileCard: {
      gap: 16,
      paddingTop: 2,
    },
    profileTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    profileIdentity: {
      flex: 1,
    },
    displayName: {
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    username: {
      marginTop: 3,
      color: colors.accentText,
      fontSize: 16,
      lineHeight: 22,
    },
    profilePath: {
      marginTop: 8,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    secondaryActionButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    secondaryActionText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    bioBlock: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    bioTitle: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    bioText: {
      marginTop: 8,
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 22,
    },
  });
}
