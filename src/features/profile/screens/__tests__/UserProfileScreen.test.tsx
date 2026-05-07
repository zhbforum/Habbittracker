import { act, render, screen } from "@testing-library/react-native";
import { StatusBar } from "expo-status-bar";
import type { ComponentProps, ReactNode } from "react";
import { Text } from "react-native";

import { HomeFooter } from "@shared/navigation/HomeFooter";
import { useAppTheme } from "@/shared/theme";
import { createSupabaseUser } from "@/test/fixtures/auth";
import {
  createAchievementProgress,
  createAchievementSummary,
  createUserProfile,
  createUserStats,
} from "@/test/fixtures/profile";

import { AchievementsExplorerSheet } from "../../components/AchievementsExplorerSheet";
import { ProfileEditSheet } from "../../components/ProfileEditSheet";
import { ProfileSignOutDialog } from "../../components/ProfileSignOutDialog";
import { ProfileThemeSheet } from "../../components/ProfileThemeSheet";
import { UserProfileDetailsSection } from "../../components/UserProfileDetailsSection";
import { UserProfileLoaderCard } from "../../components/UserProfileLoaderCard";
import { UserProfilePageHeader } from "../../components/UserProfilePageHeader";
import { UsernameSetupCard } from "../../components/UsernameSetupCard";
import { useUserProfileScreenViewModel } from "../../hooks/useUserProfileScreenViewModel";
import { UserProfileScreen } from "../UserProfileScreen";

function mockSafeAreaView({ children }: { children: ReactNode }) {
  return children;
}

function mockAppText({ children, ...props }: ComponentProps<typeof Text>) {
  return <Text {...props}>{children}</Text>;
}

jest.mock("expo-status-bar", () => ({
  StatusBar: jest.fn(() => null),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: jest.fn(mockSafeAreaView),
}));

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("@/shared/ui", () => ({
  AppText: mockAppText,
}));

jest.mock("@shared/navigation/HomeFooter", () => ({
  HomeFooter: jest.fn(() => null),
}));

jest.mock("../../hooks/useUserProfileScreenViewModel", () => ({
  useUserProfileScreenViewModel: jest.fn(),
}));

jest.mock("../UserProfileScreen.styles", () => ({
  createUserProfileScreenStyles: jest.fn(() => ({
    safeArea: {},
    content: {},
    scrollContent: {},
    errorBanner: {},
    errorBannerText: {},
  })),
}));

jest.mock("../../components/UserProfilePageHeader", () => ({
  UserProfilePageHeader: jest.fn(() => null),
}));

jest.mock("../../components/UsernameSetupCard", () => ({
  UsernameSetupCard: jest.fn(() => null),
}));

jest.mock("../../components/UserProfileDetailsSection", () => ({
  UserProfileDetailsSection: jest.fn(() => null),
}));

jest.mock("../../components/UserProfileLoaderCard", () => ({
  UserProfileLoaderCard: jest.fn(() => null),
}));

jest.mock("../../components/ProfileThemeSheet", () => ({
  ProfileThemeSheet: jest.fn(() => null),
}));

jest.mock("../../components/ProfileSignOutDialog", () => ({
  ProfileSignOutDialog: jest.fn(() => null),
}));

jest.mock("../../components/ProfileEditSheet", () => ({
  ProfileEditSheet: jest.fn(() => null),
}));

jest.mock("../../components/AchievementsExplorerSheet", () => ({
  AchievementsExplorerSheet: jest.fn(() => null),
}));

const useAppThemeMock = jest.mocked(useAppTheme);
const useUserProfileScreenViewModelMock = jest.mocked(useUserProfileScreenViewModel);
const statusBarMock = jest.mocked(StatusBar);
const userProfilePageHeaderMock = jest.mocked(UserProfilePageHeader);
const usernameSetupCardMock = jest.mocked(UsernameSetupCard);
const userProfileDetailsSectionMock = jest.mocked(UserProfileDetailsSection);
const userProfileLoaderCardMock = jest.mocked(UserProfileLoaderCard);
const profileThemeSheetMock = jest.mocked(ProfileThemeSheet);
const profileSignOutDialogMock = jest.mocked(ProfileSignOutDialog);
const profileEditSheetMock = jest.mocked(ProfileEditSheet);
const achievementsExplorerSheetMock = jest.mocked(AchievementsExplorerSheet);
const homeFooterMock = jest.mocked(HomeFooter);

type UserProfileScreenViewModel = ReturnType<typeof useUserProfileScreenViewModel>;

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

function createViewModel(
  overrides: Partial<UserProfileScreenViewModel> = {},
): UserProfileScreenViewModel {
  return {
    activeTab: "profile",
    handleTabPress: jest.fn(),
    mode: "light",
    isLoading: false,
    isSaving: false,
    isPickingAvatar: false,
    profile: createUserProfile(),
    stats: createUserStats(),
    achievements: [createAchievementProgress()],
    achievementSummary: createAchievementSummary(),
    formValues: {
      name: "Alex Doe",
      username: "alex",
      bio: "Keep moving.",
      avatarUrl: "",
    },
    setupUsernameValue: "",
    pendingAvatarUri: null,
    errorMessage: null,
    requiresUsernameSetup: false,
    isThemeSheetOpen: false,
    isEditSheetOpen: false,
    canChangeUsername: true,
    usernameChangeHint: null,
    isSignOutDialogOpen: false,
    profileSeed: "seed-1",
    usernameLabel: "@alex",
    pageTitle: "Your Profile",
    publicProfilePath: "/u/alex",
    setSetupUsernameValue: jest.fn(),
    setFormField: jest.fn(),
    setIsThemeSheetOpen: jest.fn(),
    setIsEditSheetOpen: jest.fn(),
    handleThemeChange: jest.fn(),
    handleEditSave: jest.fn(),
    handleSetupSubmit: jest.fn(),
    handleOpenSignOutDialog: jest.fn(),
    handleConfirmSignOut: jest.fn(),
    closeSignOutDialog: jest.fn(),
    handlePickAvatarFromGallery: jest.fn(),
    handleResetAvatar: jest.fn(),
    reload: jest.fn(),
    ...overrides,
  } as UserProfileScreenViewModel;
}

describe("UserProfileScreen", () => {
  const user = createSupabaseUser({ id: "user-profile-1" });

  beforeEach(() => {
    jest.clearAllMocks();

    useAppThemeMock.mockReturnValue({
      colors: {
        background: "#101010",
      },
      isDark: false,
    } as ReturnType<typeof useAppTheme>);

    useUserProfileScreenViewModelMock.mockReturnValue(createViewModel());
  });

  it("Given user profile screen render, When mounting with authenticated user, Then it builds state using theme and view model hook", () => {
    render(<UserProfileScreen user={user} />);

    expect(useAppThemeMock).toHaveBeenCalledTimes(1);
    expect(useUserProfileScreenViewModelMock).toHaveBeenCalledWith({
      user,
    });
    expect(userProfilePageHeaderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Your Profile",
      }),
      undefined,
    );
  });

  it("Given dark mode theme, When rendering screen, Then status bar switches to light content", () => {
    useAppThemeMock.mockReturnValue({
      colors: {
        background: "#000000",
      },
      isDark: true,
    } as ReturnType<typeof useAppTheme>);

    render(<UserProfileScreen user={user} />);

    expect(statusBarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        style: "light",
      }),
      undefined,
    );
  });

  it("Given username setup required, When rendering profile screen, Then it shows UsernameSetupCard with setup actions", () => {
    const viewModel = createViewModel({
      requiresUsernameSetup: true,
      setupUsernameValue: "new_user",
      isSaving: true,
    });
    useUserProfileScreenViewModelMock.mockReturnValue(viewModel);

    render(<UserProfileScreen user={user} />);

    expect(usernameSetupCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        value: "new_user",
        isSaving: true,
        onChange: viewModel.setSetupUsernameValue,
        onSubmit: viewModel.handleSetupSubmit,
      }),
      undefined,
    );
  });

  it("Given profile exists, When rendering, Then it shows details section and hides loader fallback", () => {
    const viewModel = createViewModel({
      profile: createUserProfile({ username: "visible-user" }),
    });
    useUserProfileScreenViewModelMock.mockReturnValue(viewModel);

    render(<UserProfileScreen user={user} />);

    expect(userProfileDetailsSectionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: viewModel.profile,
        stats: viewModel.stats,
        achievements: viewModel.achievements,
      }),
      undefined,
    );
    expect(userProfileLoaderCardMock).not.toHaveBeenCalled();
  });

  it("Given no profile data, When rendering, Then it shows loader card with retry action", () => {
    const viewModel = createViewModel({
      profile: null,
      isLoading: true,
    });
    useUserProfileScreenViewModelMock.mockReturnValue(viewModel);

    render(<UserProfileScreen user={user} />);

    expect(userProfileLoaderCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
        onRetry: viewModel.reload,
      }),
      undefined,
    );
  });

  it("Given profile error message, When rendering, Then it displays error banner text", () => {
    useUserProfileScreenViewModelMock.mockReturnValue(
      createViewModel({
        errorMessage: "Could not load profile",
      }),
    );

    render(<UserProfileScreen user={user} />);

    expect(screen.getByText("Could not load profile")).toBeTruthy();
  });

  it("Given local sheet actions, When header and details callbacks are triggered, Then it opens and closes corresponding sheets", () => {
    const viewModel = createViewModel();
    useUserProfileScreenViewModelMock.mockReturnValue(viewModel);

    render(<UserProfileScreen user={user} />);

    act(() => {
      const headerProps = getLastProps(userProfilePageHeaderMock) as {
        onOpenSettings: () => void;
      };
      headerProps.onOpenSettings();
    });

    expect(viewModel.setIsThemeSheetOpen).toHaveBeenCalledWith(true);

    act(() => {
      const detailsProps = getLastProps(userProfileDetailsSectionMock) as {
        onOpenAchievementsExplorer: () => void;
      };
      detailsProps.onOpenAchievementsExplorer();
    });

    expect(getLastProps(achievementsExplorerSheetMock)).toEqual(
      expect.objectContaining({
        isVisible: true,
      }),
    );

    act(() => {
      const sheetProps = getLastProps(achievementsExplorerSheetMock) as {
        onClose: () => void;
      };
      sheetProps.onClose();
    });

    expect(getLastProps(achievementsExplorerSheetMock)).toEqual(
      expect.objectContaining({
        isVisible: false,
      }),
    );
  });

  it("Given rendered bottom actions, When mounting screen, Then it passes dialog, edit sheet and footer contracts from view model", () => {
    const viewModel = createViewModel({
      isThemeSheetOpen: true,
      isSignOutDialogOpen: true,
      isEditSheetOpen: true,
    });
    useUserProfileScreenViewModelMock.mockReturnValue(viewModel);

    render(<UserProfileScreen user={user} />);

    expect(profileThemeSheetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isVisible: true,
        activeMode: "light",
        onSignOut: viewModel.handleOpenSignOutDialog,
      }),
      undefined,
    );
    expect(profileSignOutDialogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isVisible: true,
        onConfirm: viewModel.handleConfirmSignOut,
        onCancel: viewModel.closeSignOutDialog,
      }),
      undefined,
    );
    expect(profileEditSheetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isVisible: true,
        values: viewModel.formValues,
        onSave: viewModel.handleEditSave,
      }),
      undefined,
    );
    expect(homeFooterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        activeTab: "profile",
        onTabPress: viewModel.handleTabPress,
      }),
      undefined,
    );
  });
});
