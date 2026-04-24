import { StatusBar } from "expo-status-bar";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/shared/theme";

import { PublicProfileCard } from "../components/PublicProfileCard";
import { PublicProfilePageHeader } from "../components/PublicProfilePageHeader";
import { PublicProfileState } from "../components/PublicProfileState";
import { usePublicProfileScreenController } from "../hooks/usePublicProfileScreenController";
import { createPublicProfileScreenStyles } from "./PublicProfileScreen.styles";

export default function PublicProfileScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = createPublicProfileScreenStyles(colors);
  const { isLoading, errorMessage, profileData, handleBackPress } =
    usePublicProfileScreenController();
  const shouldShowNotFound = !isLoading && !errorMessage && !profileData;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <PublicProfilePageHeader onBackPress={handleBackPress} />
          <PublicProfileState
            isLoading={isLoading}
            errorMessage={errorMessage}
            isNotFound={shouldShowNotFound}
          />
          {!isLoading && profileData ? <PublicProfileCard profileData={profileData} /> : null}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
