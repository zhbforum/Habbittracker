import { render } from "@testing-library/react-native";
import type { User } from "@supabase/supabase-js";

import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useAppTheme } from "@/shared/theme";
import { darkColors, lightColors } from "@/shared/theme/colors";
import { ActionConfirmDialog } from "@/shared/ui";
import { HomeFooter } from "@shared/navigation/HomeFooter";

import { HabitsScreen } from "../HabitsScreen";
import { HabitGroupsSection } from "../../components/HabitGroupsSection";
import { HabitsContentState } from "../../components/HabitsContentState";
import { HabitEditorSheet } from "../../components/HabitEditorSheet";
import { HabitDetailsSheet } from "../../components/HabitDetailsSheet";
import { HabitGroupEditorSheet } from "../../components/HabitGroupEditorSheet";
import { HabitGroupDetailsSheet } from "../../components/HabitGroupDetailsSheet";
import { HabitsCreateButton } from "../../components/HabitsCreateButton";
import { HabitsSummaryStrip } from "../../components/HabitsSummaryStrip";
import { useHabitsScreenRouteParams } from "../../hooks/useHabitsScreenRouteParams";
import { useHabitsScreenViewModel } from "../../hooks/useHabitsScreenViewModel";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: jest.fn(() => null),
}));

jest.mock("lucide-react-native", () => ({
  Undo2: jest.fn(() => null),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: jest.fn(({ children }) => children),
}));

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("@/shared/ui", () => ({
  AppText: jest.fn(() => null),
  ActionConfirmDialog: jest.fn(() => null),
}));

jest.mock("@shared/navigation/HomeFooter", () => ({
  HomeFooter: jest.fn(() => null),
}));

jest.mock("../HabitsScreen.styles", () => ({
  createHabitsScreenStyles: jest.fn(() => ({
    safeArea: {},
    content: {},
    scrollContent: {},
    groupsShell: {},
    habitsShell: {},
    habitsShellHeader: {},
    habitsShellTitle: {},
    habitsShellSubtitle: {},
  })),
}));

jest.mock("../../hooks/useHabitsScreenViewModel", () => ({
  useHabitsScreenViewModel: jest.fn(),
}));

jest.mock("../../hooks/useHabitsScreenRouteParams", () => ({
  useHabitsScreenRouteParams: jest.fn(),
}));

jest.mock("../../components/HabitsContentState", () => ({
  HabitsContentState: jest.fn(() => null),
}));

jest.mock("../../components/HabitsCreateButton", () => ({
  HabitsCreateButton: jest.fn(() => null),
}));

jest.mock("../../components/HabitsPageHeader", () => ({
  HabitsPageHeader: jest.fn(() => null),
}));

jest.mock("../../components/HabitDetailsSheet", () => ({
  HabitDetailsSheet: jest.fn(() => null),
}));

jest.mock("../../components/HabitEditorSheet", () => ({
  HabitEditorSheet: jest.fn(() => null),
}));

jest.mock("../../components/HabitGroupDetailsSheet", () => ({
  HabitGroupDetailsSheet: jest.fn(() => null),
}));

jest.mock("../../components/HabitGroupEditorSheet", () => ({
  HabitGroupEditorSheet: jest.fn(() => null),
}));

jest.mock("../../components/HabitGroupsSection", () => ({
  HabitGroupsSection: jest.fn(() => null),
}));

jest.mock("../../components/HabitsSummaryStrip", () => ({
  HabitsSummaryStrip: jest.fn(() => null),
}));

const user = {
  id: "user-1",
} as unknown as User;

const habit = {
  id: "habit-1",
  name: "Read books",
};

const group = {
  id: "group-1",
  name: "Health",
};

const mockedUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockedUseAppTheme = jest.mocked(useAppTheme);
const mockedUseHabitsScreenViewModel = jest.mocked(useHabitsScreenViewModel);
const mockedUseHabitsScreenRouteParams = jest.mocked(
  useHabitsScreenRouteParams,
);

type HabitsScreenViewModel = ReturnType<typeof useHabitsScreenViewModel>;
type AppTheme = ReturnType<typeof useAppTheme>;

type SetupOptions = {
  routeParams?: Record<string, string | string[]>;
  viewModelOverrides?: Partial<HabitsScreenViewModel>;
  themeOverrides?: Partial<AppTheme>;
};

function getLastProps(mock: unknown) {
  return (mock as jest.Mock).mock.calls.at(-1)?.[0];
}

function createViewModel(
  overrides: Partial<HabitsScreenViewModel> = {},
): HabitsScreenViewModel {
  return {
    activeTab: "habits",
    handleTabPress: jest.fn(),

    isLoading: false,
    isSaving: false,
    errorMessage: null,

    habits: [habit],
    groups: [group],

    summary: {
      totalHabits: 1,
      completedToday: 0,
      totalGroups: 1,
    },

    selectedHabit: habit,
    selectedGroup: group,

    isEditorOpen: false,
    isDetailsOpen: false,
    isGroupEditorOpen: false,
    isGroupDetailsOpen: false,

    editorMode: "create",
    groupEditorMode: "create",

    formValues: {},
    groupFormValues: {},

    pendingUndoHabit: habit,
    isUndoDialogOpen: true,

    setFormField: jest.fn(),
    setGroupFormField: jest.fn(),
    toggleCustomWeekday: jest.fn(),
    toggleHabitInGroupForm: jest.fn(),

    openCreateHabit: jest.fn(),
    openHabitDetails: jest.fn(),
    openCreateGroup: jest.fn(),
    openGroupDetails: jest.fn(),

    closeEditor: jest.fn(),
    closeDetails: jest.fn(),
    closeGroupEditor: jest.fn(),
    closeGroupDetails: jest.fn(),

    handleSaveHabit: jest.fn(),
    handleSaveGroup: jest.fn(),
    handleDeleteHabit: jest.fn(),
    handleDeleteGroup: jest.fn(),

    handleToggleTodayPress: jest.fn(),
    setTodayProgressValue: jest.fn(),
    handleConfirmUndoCompletion: jest.fn(),
    handleEditFromDetails: jest.fn(),
    handleEditGroupFromDetails: jest.fn(),

    closeUndoDialog: jest.fn(),
    reload: jest.fn(),

    ...overrides,
  } as HabitsScreenViewModel;
}

function setup({
  routeParams = {},
  viewModelOverrides = {},
  themeOverrides = {},
}: SetupOptions = {}) {
  const viewModel = createViewModel(viewModelOverrides);

  const isDark = themeOverrides.isDark ?? false;

  mockedUseLocalSearchParams.mockReturnValue(routeParams);

  mockedUseAppTheme.mockReturnValue({
    mode: isDark ? "dark" : "light",
    colors: isDark ? darkColors : lightColors,
    isDark,
    setMode: jest.fn(),
    ...themeOverrides,
  });

  mockedUseHabitsScreenViewModel.mockReturnValue(viewModel);

  render(<HabitsScreen user={user} />);

  return {
    viewModel,
  };
}

describe("HabitsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("passes user to habits screen view model", () => {
    setup();

    expect(mockedUseHabitsScreenViewModel).toHaveBeenCalledWith({
      user,
    });
  });

  it("passes string route params to route params hook", () => {
    const { viewModel } = setup({
      routeParams: {
        create: "habit",
        habitId: "habit-1",
        groupId: "group-1",
      },
    });

    expect(mockedUseHabitsScreenRouteParams).toHaveBeenCalledWith({
      createParam: "habit",
      habitIdParam: "habit-1",
      groupIdParam: "group-1",
      openCreateHabit: viewModel.openCreateHabit,
      openHabitDetails: viewModel.openHabitDetails,
      openGroupDetails: viewModel.openGroupDetails,
    });
  });

  it("normalizes array route params before passing them to route params hook", () => {
    const { viewModel } = setup({
      routeParams: {
        create: ["habit"],
        habitId: ["habit-1"],
        groupId: ["group-1"],
      },
    });

    expect(mockedUseHabitsScreenRouteParams).toHaveBeenCalledWith({
      createParam: "habit",
      habitIdParam: "habit-1",
      groupIdParam: "group-1",
      openCreateHabit: viewModel.openCreateHabit,
      openHabitDetails: viewModel.openHabitDetails,
      openGroupDetails: viewModel.openGroupDetails,
    });
  });

  it("uses dark status bar style for light theme", () => {
    setup({
      themeOverrides: {
        isDark: false,
      },
    });

    expect(getLastProps(StatusBar)).toEqual({
      style: "dark",
    });
  });

  it("uses light status bar style for dark theme", () => {
    setup({
      themeOverrides: {
        isDark: true,
      },
    });

    expect(getLastProps(StatusBar)).toEqual({
      style: "light",
    });
  });

  it("passes footer props from view model", () => {
    const { viewModel } = setup();

    expect(getLastProps(HomeFooter)).toEqual(
      expect.objectContaining({
        activeTab: "habits",
        onTabPress: viewModel.handleTabPress,
      }),
    );
  });

  it("passes summary props from view model", () => {
    const { viewModel } = setup();

    expect(getLastProps(HabitsSummaryStrip)).toEqual(
      expect.objectContaining({
        summary: viewModel.summary,
      }),
    );
  });

  it("passes group section props from view model", () => {
    const { viewModel } = setup();

    expect(getLastProps(HabitGroupsSection)).toEqual(
      expect.objectContaining({
        groups: viewModel.groups,
        isLoading: false,
        isSaving: false,
        hasHabits: true,
        onCreateGroup: viewModel.openCreateGroup,
        onOpenGroup: viewModel.openGroupDetails,
      }),
    );
  });

  it("passes hasHabits=false when habits list is empty", () => {
    setup({
      viewModelOverrides: {
        habits: [],
      },
    });

    expect(getLastProps(HabitGroupsSection)).toEqual(
      expect.objectContaining({
        hasHabits: false,
      }),
    );
  });

  it("passes habits content props from view model", () => {
    const { viewModel } = setup();

    expect(getLastProps(HabitsContentState)).toEqual(
      expect.objectContaining({
        isLoading: false,
        errorMessage: null,
        habits: viewModel.habits,
        onRetry: viewModel.reload,
        onCreatePress: viewModel.openCreateHabit,
        onOpenHabit: viewModel.openHabitDetails,
        onToggleToday: viewModel.handleToggleTodayPress,
      }),
    );
  });

  it("passes create button props from view model", () => {
    const { viewModel } = setup();

    expect(getLastProps(HabitsCreateButton)).toEqual(
      expect.objectContaining({
        onPress: viewModel.openCreateHabit,
      }),
    );
  });

  it("passes habit editor sheet props from view model", () => {
    const { viewModel } = setup({
      viewModelOverrides: {
        isEditorOpen: true,
        editorMode: "edit",
        errorMessage: "Failed to save",
      },
    });

    expect(getLastProps(HabitEditorSheet)).toEqual(
      expect.objectContaining({
        isVisible: true,
        mode: "edit",
        values: viewModel.formValues,
        errorMessage: "Failed to save",
        isSaving: false,
        onFieldChange: viewModel.setFormField,
        onToggleCustomWeekday: viewModel.toggleCustomWeekday,
        onSave: viewModel.handleSaveHabit,
        onClose: viewModel.closeEditor,
      }),
    );
  });

  it("passes habit details sheet props from view model", () => {
    const { viewModel } = setup({
      viewModelOverrides: {
        isDetailsOpen: true,
      },
    });

    expect(getLastProps(HabitDetailsSheet)).toEqual(
      expect.objectContaining({
        isVisible: true,
        habit,
        isSaving: false,
        onClose: viewModel.closeDetails,
        onToggleToday: viewModel.handleToggleTodayPress,
        onSetTodayProgressValue: viewModel.setTodayProgressValue,
        onEdit: viewModel.handleEditFromDetails,
        onDelete: viewModel.handleDeleteHabit,
      }),
    );
  });

  it("passes group editor sheet props from view model", () => {
    const { viewModel } = setup({
      viewModelOverrides: {
        isGroupEditorOpen: true,
        groupEditorMode: "edit",
        errorMessage: "Failed to save",
      },
    });

    expect(getLastProps(HabitGroupEditorSheet)).toEqual(
      expect.objectContaining({
        isVisible: true,
        mode: "edit",
        values: viewModel.groupFormValues,
        errorMessage: "Failed to save",
        isSaving: false,
        availableHabits: viewModel.habits,
        onFieldChange: viewModel.setGroupFormField,
        onToggleHabit: viewModel.toggleHabitInGroupForm,
        onSave: viewModel.handleSaveGroup,
        onClose: viewModel.closeGroupEditor,
      }),
    );
  });

  it("passes group details sheet props from view model", () => {
    const { viewModel } = setup({
      viewModelOverrides: {
        isGroupDetailsOpen: true,
      },
    });

    expect(getLastProps(HabitGroupDetailsSheet)).toEqual(
      expect.objectContaining({
        isVisible: true,
        group,
        habits: viewModel.habits,
        isSaving: false,
        onClose: viewModel.closeGroupDetails,
        onEdit: viewModel.handleEditGroupFromDetails,
        onDelete: viewModel.handleDeleteGroup,
      }),
    );
  });

  it("shows undo dialog with habit name", () => {
    const { viewModel } = setup();

    expect(getLastProps(ActionConfirmDialog)).toEqual(
      expect.objectContaining({
        isVisible: true,
        title: "Undo completion",
        message:
          'Are you sure you want to remove today\'s completion for "Read books"?',
        confirmLabel: "Undo",
        confirmLoadingLabel: "Updating...",
        isConfirming: false,
        onCancel: viewModel.closeUndoDialog,
        onConfirm: viewModel.handleConfirmUndoCompletion,
        confirmTone: "default",
      }),
    );
  });

  it("shows fallback undo message when pending undo habit is missing", () => {
    setup({
      viewModelOverrides: {
        pendingUndoHabit: null,
        isSaving: true,
      },
    });

    expect(getLastProps(ActionConfirmDialog)).toEqual(
      expect.objectContaining({
        message: "Are you sure you want to remove today's completion?",
        isConfirming: true,
      }),
    );
  });
});
