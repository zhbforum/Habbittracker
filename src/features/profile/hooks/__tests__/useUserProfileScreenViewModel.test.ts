import { act, renderHook } from "@testing-library/react-native";

import { createSupabaseUser } from "@/test/fixtures/auth";
import { createAchievementProgress, createAchievementSummary, createUserProfile, createUserStats } from "@/test/fixtures/profile";
import type { UserProfile } from "@entities/profile/model/types";
import { useHomeFooterNavigation } from "@shared/navigation/useHomeFooterNavigation";

import { useProfileScreenController } from "../useProfileScreenController";
import { useUserProfileScreenViewModel } from "../useUserProfileScreenViewModel";

jest.mock("@shared/navigation/useHomeFooterNavigation", () => ({
  useHomeFooterNavigation: jest.fn(),
}));

jest.mock("../useProfileScreenController", () => ({
  useProfileScreenController: jest.fn(),
}));

const useHomeFooterNavigationMock =
  useHomeFooterNavigation as jest.MockedFunction<typeof useHomeFooterNavigation>;
const useProfileScreenControllerMock =
  useProfileScreenController as jest.MockedFunction<typeof useProfileScreenController>;

type HomeFooterNavigationState = ReturnType<typeof useHomeFooterNavigation>;
type ProfileControllerState = ReturnType<typeof useProfileScreenController>;

function createProfileControllerState(
  overrides: Partial<ProfileControllerState> = {},
): ProfileControllerState {
  return {
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
      avatarUrl: "https://example.com/avatar.png",
    },
    setupUsernameValue: "alex",
    pendingAvatarUri: null,
    errorMessage: null,
    requiresUsernameSetup: false,
    isThemeSheetOpen: false,
    isEditSheetOpen: false,
    canChangeUsername: true,
    usernameChangeHint: "Username can be changed once every 14 days.",
    setSetupUsernameValue: jest.fn(),
    setFormField: jest.fn(),
    setIsThemeSheetOpen: jest.fn(),
    setIsEditSheetOpen: jest.fn(),
    handleThemeChange: jest.fn(async () => undefined),
    handleEditSave: jest.fn(async () => undefined),
    handleSetupSubmit: jest.fn(async () => undefined),
    handleSignOut: jest.fn(async () => undefined),
    handlePickAvatarFromGallery: jest.fn(async () => undefined),
    handleResetAvatar: jest.fn(),
    reload: jest.fn(async () => undefined),
    ...overrides,
  };
}

describe("useUserProfileScreenViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const navigationState: HomeFooterNavigationState = {
      activeTab: "profile",
      handleTabPress: jest.fn(),
    };
    useHomeFooterNavigationMock.mockReturnValue(navigationState);
    useProfileScreenControllerMock.mockReturnValue(createProfileControllerState());
  });

  it("combines profile controller with navigation and derived profile labels", () => {
    const { result } = renderHook(() =>
      useUserProfileScreenViewModel({ user: createSupabaseUser({ id: "user-42" }) }),
    );

    expect(result.current.activeTab).toBe("profile");
    expect(result.current.profileSeed).toBe("alex");
    expect(result.current.usernameLabel).toBe("@alex");
    expect(result.current.pageTitle).toBe("alex's profile");
    expect(result.current.publicProfilePath).toBe("/u/alex");
    expect(result.current.isSignOutDialogOpen).toBe(false);
  });

  it("uses fallback labels when username is missing", () => {
    const profileWithoutUsername: UserProfile = createUserProfile({
      id: "profile-1",
      username: null,
    });
    useProfileScreenControllerMock.mockReturnValue(
      createProfileControllerState({
        profile: profileWithoutUsername,
      }),
    );

    const { result } = renderHook(() =>
      useUserProfileScreenViewModel({ user: createSupabaseUser({ id: "user-fallback" }) }),
    );

    expect(result.current.profileSeed).toBe("profile-1");
    expect(result.current.usernameLabel).toBe("@username");
    expect(result.current.pageTitle).toBe("Profile");
    expect(result.current.publicProfilePath).toBe(
      "Complete username setup to unlock public profile URL.",
    );
  });

  it("opens sign-out dialog and closes theme sheet first", () => {
    const controllerState = createProfileControllerState();
    useProfileScreenControllerMock.mockReturnValue(controllerState);

    const { result } = renderHook(() =>
      useUserProfileScreenViewModel({ user: createSupabaseUser({ id: "user-open" }) }),
    );

    act(() => {
      result.current.handleOpenSignOutDialog();
    });

    expect(controllerState.setIsThemeSheetOpen).toHaveBeenCalledWith(false);
    expect(result.current.isSignOutDialogOpen).toBe(true);
  });

  it("does not open or confirm sign-out while save is in progress", () => {
    const controllerState = createProfileControllerState({
      isSaving: true,
    });
    useProfileScreenControllerMock.mockReturnValue(controllerState);

    const { result } = renderHook(() =>
      useUserProfileScreenViewModel({ user: createSupabaseUser({ id: "user-busy" }) }),
    );

    act(() => {
      result.current.handleOpenSignOutDialog();
      result.current.handleConfirmSignOut();
    });

    expect(controllerState.setIsThemeSheetOpen).not.toHaveBeenCalled();
    expect(controllerState.handleSignOut).not.toHaveBeenCalled();
    expect(result.current.isSignOutDialogOpen).toBe(false);
  });

  it("confirms and closes sign-out dialog", () => {
    const controllerState = createProfileControllerState();
    useProfileScreenControllerMock.mockReturnValue(controllerState);

    const { result } = renderHook(() =>
      useUserProfileScreenViewModel({ user: createSupabaseUser({ id: "user-signout" }) }),
    );

    act(() => {
      result.current.handleOpenSignOutDialog();
    });
    expect(result.current.isSignOutDialogOpen).toBe(true);

    act(() => {
      result.current.handleConfirmSignOut();
    });

    expect(controllerState.handleSignOut).toHaveBeenCalledTimes(1);
    expect(result.current.isSignOutDialogOpen).toBe(false);
  });

  it("closes sign-out dialog without triggering sign-out", () => {
    const controllerState = createProfileControllerState();
    useProfileScreenControllerMock.mockReturnValue(controllerState);

    const { result } = renderHook(() =>
      useUserProfileScreenViewModel({ user: createSupabaseUser({ id: "user-close-dialog" }) }),
    );

    act(() => {
      result.current.handleOpenSignOutDialog();
    });
    expect(result.current.isSignOutDialogOpen).toBe(true);

    act(() => {
      result.current.closeSignOutDialog();
    });

    expect(result.current.isSignOutDialogOpen).toBe(false);
    expect(controllerState.handleSignOut).not.toHaveBeenCalled();
  });
});
