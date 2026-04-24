import { StatusBar } from "expo-status-bar";
import { ScrollView, View } from "react-native";
import type { User } from "@supabase/supabase-js";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeFooter } from "@/features/home/components/HomeFooter";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

import { ProfileEditSheet } from "../components/ProfileEditSheet";
import { ProfileSignOutDialog } from "../components/ProfileSignOutDialog";
import { ProfileThemeSheet } from "../components/ProfileThemeSheet";
import { UserProfileDetailsSection } from "../components/UserProfileDetailsSection";
import { UserProfileLoaderCard } from "../components/UserProfileLoaderCard";
import { UserProfilePageHeader } from "../components/UserProfilePageHeader";
import { UsernameSetupCard } from "../components/UsernameSetupCard";
import { useUserProfileScreenViewModel } from "../hooks/useUserProfileScreenViewModel";
import { createUserProfileScreenStyles } from "./UserProfileScreen.styles";

type UserProfileScreenProps = {
  user: User;
};

export function UserProfileScreen({ user }: UserProfileScreenProps) {
  const { colors, isDark } = useAppTheme();
  const styles = createUserProfileScreenStyles(colors);
  const {
    activeTab,
    handleTabPress,
    mode,
    isLoading,
    isSaving,
    isPickingAvatar,
    profile,
    stats,
    formValues,
    setupUsernameValue,
    pendingAvatarUri,
    errorMessage,
    requiresUsernameSetup,
    isThemeSheetOpen,
    isEditSheetOpen,
    canChangeUsername,
    usernameChangeHint,
    isSignOutDialogOpen,
    profileSeed,
    usernameLabel,
    pageTitle,
    publicProfilePath,
    setSetupUsernameValue,
    setFormField,
    setIsThemeSheetOpen,
    setIsEditSheetOpen,
    handleThemeChange,
    handleEditSave,
    handleSetupSubmit,
    handleOpenSignOutDialog,
    handleConfirmSignOut,
    closeSignOutDialog,
    handlePickAvatarFromGallery,
    handleResetAvatar,
    reload,
  } = useUserProfileScreenViewModel({
    user,
  });

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <UserProfilePageHeader
              title={pageTitle}
              onOpenSettings={() => setIsThemeSheetOpen(true)}
            />

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <AppText style={styles.errorBannerText}>{errorMessage}</AppText>
              </View>
            ) : null}

            {requiresUsernameSetup ? (
              <UsernameSetupCard
                value={setupUsernameValue}
                isSaving={isSaving}
                onChange={setSetupUsernameValue}
                onSubmit={handleSetupSubmit}
              />
            ) : null}

            {profile ? (
              <UserProfileDetailsSection
                profile={profile}
                profileSeed={profileSeed}
                usernameLabel={usernameLabel}
                publicProfilePath={publicProfilePath}
                stats={stats}
                onOpenEdit={() => setIsEditSheetOpen(true)}
              />
            ) : (
              <UserProfileLoaderCard isLoading={isLoading} onRetry={reload} />
            )}
          </ScrollView>
        </View>

        <HomeFooter activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>

      <ProfileThemeSheet
        isVisible={isThemeSheetOpen}
        activeMode={mode}
        isSigningOut={isSaving}
        onSelectMode={handleThemeChange}
        onSignOut={handleOpenSignOutDialog}
        onClose={() => setIsThemeSheetOpen(false)}
      />

      <ProfileSignOutDialog
        isVisible={isSignOutDialogOpen}
        isSigningOut={isSaving}
        onCancel={closeSignOutDialog}
        onConfirm={handleConfirmSignOut}
      />

      <ProfileEditSheet
        isVisible={isEditSheetOpen}
        values={formValues}
        pendingAvatarUri={pendingAvatarUri}
        isSaving={isSaving}
        isPickingAvatar={isPickingAvatar}
        canChangeUsername={canChangeUsername}
        usernameChangeHint={usernameChangeHint}
        onFieldChange={setFormField}
        onPickAvatar={handlePickAvatarFromGallery}
        onResetAvatar={handleResetAvatar}
        onSave={handleEditSave}
        onClose={() => setIsEditSheetOpen(false)}
      />
    </>
  );
}
