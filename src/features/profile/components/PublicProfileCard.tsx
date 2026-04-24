import { StyleSheet, View } from "react-native";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import type { PublicProfile } from "../model/types";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileStatCard } from "./ProfileStatCard";

type PublicProfileCardProps = {
  profileData: PublicProfile;
};

export function PublicProfileCard({ profileData }: PublicProfileCardProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarWrap}>
        <ProfileAvatar
          seed={profileData.profile.username ?? profileData.profile.id}
          avatarUrl={profileData.profile.avatarUrl}
          size={106}
        />
      </View>

      <AppText style={styles.displayName}>{profileData.profile.name}</AppText>
      <AppText style={styles.username}>@{profileData.profile.username}</AppText>

      <View style={styles.statsRow}>
        <ProfileStatCard label="Total habits" value={String(profileData.stats.totalHabits)} />
        <ProfileStatCard
          label="Current streak"
          value={`${profileData.stats.currentStreak}d`}
          showFlame={profileData.stats.currentStreak >= 1}
        />
      </View>

      <View style={styles.bioWrap}>
        <AppText style={styles.bioTitle}>Bio</AppText>
        <AppText style={styles.bioText}>
          {profileData.profile.bio || "No bio provided yet."}
        </AppText>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    profileCard: {
      marginTop: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 18,
      gap: 14,
    },
    avatarWrap: {
      alignItems: "center",
      marginTop: 4,
    },
    displayName: {
      marginTop: 4,
      textAlign: "center",
      color: colors.textPrimary,
      fontSize: 24,
      lineHeight: 30,
    },
    username: {
      textAlign: "center",
      color: colors.accentText,
      fontSize: 16,
      lineHeight: 22,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 6,
    },
    bioWrap: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    bioTitle: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    bioText: {
      marginTop: 6,
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 22,
    },
  });
}
