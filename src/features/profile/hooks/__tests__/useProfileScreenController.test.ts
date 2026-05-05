import { act, renderHook } from "@testing-library/react-native";

import { createSupabaseUser } from "@/test/fixtures/auth";
import { createAchievementProgress, createAchievementSummary, createUserProfile, createUserStats } from "@/test/fixtures/profile";
import { USERNAME_CHANGE_COOLDOWN_DAYS } from "@features/profile/model/constants";
import { lightColors, useAppTheme } from "@/shared/theme";

import { getUsernameChangeInfo } from "../../services/profileService";
import { useProfileScreenController } from "../useProfileScreenController";
import { useProfileScreenData } from "../useProfileScreenData";
import { useProfileScreenEditActions } from "../useProfileScreenEditActions";
import { useProfileScreenSessionActions } from "../useProfileScreenSessionActions";

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("../useProfileScreenData", () => ({
  useProfileScreenData: jest.fn(),
}));

jest.mock("../useProfileScreenEditActions", () => ({
  useProfileScreenEditActions: jest.fn(),
}));

jest.mock("../useProfileScreenSessionActions", () => ({
  useProfileScreenSessionActions: jest.fn(),
}));

jest.mock("../../services/profileService", () => ({
  getUsernameChangeInfo: jest.fn(),
}));

const useAppThemeMock = useAppTheme as jest.MockedFunction<typeof useAppTheme>;
const useProfileScreenDataMock = useProfileScreenData as jest.MockedFunction<typeof useProfileScreenData>;
const useProfileScreenEditActionsMock =
  useProfileScreenEditActions as jest.MockedFunction<typeof useProfileScreenEditActions>;
const useProfileScreenSessionActionsMock =
  useProfileScreenSessionActions as jest.MockedFunction<typeof useProfileScreenSessionActions>;
const getUsernameChangeInfoMock =
  getUsernameChangeInfo as jest.MockedFunction<typeof getUsernameChangeInfo>;

type ProfileScreenDataState = ReturnType<typeof useProfileScreenData>;
type ProfileScreenEditActionsState = ReturnType<typeof useProfileScreenEditActions>;
type ProfileScreenSessionActionsState = ReturnType<typeof useProfileScreenSessionActions>;

function createProfileScreenDataState(
  overrides: Partial<ProfileScreenDataState> = {},
): ProfileScreenDataState {
  return {
    isLoading: false,
    profile: createUserProfile(),
    stats: createUserStats(),
    achievements: [createAchievementProgress()],
    achievementSummary: createAchievementSummary(),
    errorMessage: null,
    pendingAvatarUri: null,
    formValues: {
      name: "Alex Doe",
      username: "alex",
      bio: "Keep moving.",
      avatarUrl: "https://example.com/avatar.png",
    },
    setupUsernameValue: "alex",
    setProfile: jest.fn(),
    setErrorMessage: jest.fn(),
    setPendingAvatarUri: jest.fn(),
    setFormValues: jest.fn(),
    setSetupUsernameValue: jest.fn(),
    loadProfileData: jest.fn(async () => undefined),
    ...overrides,
  };
}

function createEditActionsState(
  overrides: Partial<ProfileScreenEditActionsState> = {},
): ProfileScreenEditActionsState {
  return {
    setFormField: jest.fn(),
    handlePickAvatarFromGallery: jest.fn(async () => undefined),
    handleResetAvatar: jest.fn(),
    handleSetupSubmit: jest.fn(async () => undefined),
    handleEditSave: jest.fn(async () => undefined),
    ...overrides,
  };
}

function createSessionActionsState(
  overrides: Partial<ProfileScreenSessionActionsState> = {},
): ProfileScreenSessionActionsState {
  return {
    handleThemeChange: jest.fn(async () => undefined),
    handleSignOut: jest.fn(async () => undefined),
    ...overrides,
  };
}

describe("useProfileScreenController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      mode: "light",
      setMode: jest.fn(),
      colors: lightColors,
      isDark: false,
    });
    useProfileScreenDataMock.mockReturnValue(createProfileScreenDataState());
    useProfileScreenEditActionsMock.mockReturnValue(createEditActionsState());
    useProfileScreenSessionActionsMock.mockReturnValue(createSessionActionsState());
    getUsernameChangeInfoMock.mockReturnValue({
      canChangeNow: true,
      nextChangeAt: null,
    });
  });

  it("combines data, edit and session actions into a single controller state", () => {
    const { result } = renderHook(() =>
      useProfileScreenController({
        user: createSupabaseUser({ id: "user-1" }),
      }),
    );

    expect(result.current.mode).toBe("light");
    expect(result.current.profile?.id).toBe("user-1");
    expect(result.current.stats.totalHabits).toBe(4);
    expect(result.current.achievements).toHaveLength(1);
    expect(result.current.canChangeUsername).toBe(true);
    expect(result.current.usernameChangeHint).toBe(
      `Username can be changed once every ${USERNAME_CHANGE_COOLDOWN_DAYS} days.`,
    );
    expect(result.current.requiresUsernameSetup).toBe(false);
  });

  it("marks username setup as required only when loaded profile has no username", () => {
    useProfileScreenDataMock.mockReturnValue(
      createProfileScreenDataState({
        profile: createUserProfile({
          username: null,
        }),
      }),
    );

    const { result } = renderHook(() =>
      useProfileScreenController({
        user: createSupabaseUser({ id: "user-2" }),
      }),
    );

    expect(result.current.requiresUsernameSetup).toBe(true);
  });

  it("renders cooldown hint when username cannot be changed yet", () => {
    getUsernameChangeInfoMock.mockReturnValue({
      canChangeNow: false,
      nextChangeAt: new Date(2026, 5, 20),
    });

    const { result } = renderHook(() =>
      useProfileScreenController({
        user: createSupabaseUser({ id: "user-3" }),
      }),
    );

    expect(result.current.canChangeUsername).toBe(false);
    expect(result.current.usernameChangeHint).toBe(
      "Username can be changed again on Jun 20, 2026.",
    );
  });

  it("updates local sheet state through exposed setters", () => {
    const { result } = renderHook(() =>
      useProfileScreenController({
        user: createSupabaseUser({ id: "user-4" }),
      }),
    );

    expect(result.current.isThemeSheetOpen).toBe(false);
    expect(result.current.isEditSheetOpen).toBe(false);

    act(() => {
      result.current.setIsThemeSheetOpen(true);
      result.current.setIsEditSheetOpen(true);
    });

    expect(result.current.isThemeSheetOpen).toBe(true);
    expect(result.current.isEditSheetOpen).toBe(true);
  });
});
