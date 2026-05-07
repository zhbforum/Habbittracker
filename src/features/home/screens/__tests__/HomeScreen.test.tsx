import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";
import type { User } from "@supabase/supabase-js";

import HomeScreen from "../HomeScreen";

const mockColors = {
  textPrimary: "#111111",
} as const;

const mockStyles = {
  safeArea: {},
  content: {},
  scrollContent: {},
  header: {},
  headerTextWrap: {},
  title: {},
  subtitle: {},
  fab: {},
};

const mockUser = {
  id: "user-1",
  email: "alex@example.com",
} as User;

const mockUseAppTheme = jest.fn();
const mockCreateHomeScreenStyles = jest.fn();
const mockUseHomeScreenController = jest.fn();

const mockStatusBar = jest.fn();
const mockPlus = jest.fn();

const mockHomeFooter = jest.fn();
const mockHomeProgressCard = jest.fn();
const mockHomeGroupsSection = jest.fn();
const mockHomeHabitsSection = jest.fn();

const mockAppText = ({ children, ...props }: any) => (
  <Text {...props}>{children}</Text>
);

const mockSafeAreaView = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

jest.mock("expo-status-bar", () => ({
  StatusBar: (props: unknown) => {
    mockStatusBar(props);
    return null;
  },
}));

jest.mock("lucide-react-native", () => ({
  Plus: (props: unknown) => {
    mockPlus(props);
    return null;
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: (props: any) => mockSafeAreaView(props),
}));

jest.mock("@shared/theme", () => ({
  useAppTheme: () => mockUseAppTheme(),

  layout: {
    horizontalPadding: 20,
    maxContentWidth: 720,
  },

  typography: {
    manropeRegular: "Manrope-Regular",
    manropeMedium: "Manrope-Medium",
    manropeSemiBold: "Manrope-SemiBold",
    manropeBold: "Manrope-Bold",
  },
}));

jest.mock("@shared/ui", () => ({
  AppText: (props: any) => mockAppText(props),
}));

jest.mock("@features/home/screens/HomeScreen.styles", () => ({
  createHomeScreenStyles: (colors: unknown) =>
    mockCreateHomeScreenStyles(colors),
}));

jest.mock("@features/home/hooks/useHomeScreenController", () => ({
  useHomeScreenController: (params: unknown) =>
    mockUseHomeScreenController(params),
}));

jest.mock("@shared/navigation/HomeFooter", () => ({
  HomeFooter: (props: unknown) => {
    mockHomeFooter(props);
    return null;
  },
}));

jest.mock("@features/home/components/HomeProgressCard", () => ({
  HomeProgressCard: (props: unknown) => {
    mockHomeProgressCard(props);
    return null;
  },
}));

jest.mock("@features/home/components/HomeGroupsSection", () => ({
  HomeGroupsSection: (props: unknown) => {
    mockHomeGroupsSection(props);
    return null;
  },
}));

jest.mock("@features/home/components/HomeHabitsSection", () => ({
  HomeHabitsSection: (props: unknown) => {
    mockHomeHabitsSection(props);
    return null;
  },
}));

function createController(overrides = {}) {
  return {
    isLoading: false,
    isSaving: false,
    errorMessage: null,
    activeTab: "home",
    handleTabPress: jest.fn(),

    greeting: "Good morning",
    dateLabel: "Wednesday, May 6",
    displayName: "Alex",

    todayHabits: [
      {
        id: "habit-1",
        name: "Drink water",
      },
    ],

    todayGroups: [
      {
        id: "group-1",
        name: "Health",
      },
    ],

    hasAnyGroups: true,
    hasMoreGroups: false,

    progress: {
      completed: 1,
      total: 2,
      percent: 50,
      message: "1 of 2 habits completed",
    },

    openHabits: jest.fn(),
    openCreateHabit: jest.fn(),
    openHabitById: jest.fn(),
    openGroupById: jest.fn(),
    toggleTodayCompletion: jest.fn(),
    reload: jest.fn(),

    ...overrides,
  };
}

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAppTheme.mockReturnValue({
      colors: mockColors,
      isDark: false,
    });

    mockCreateHomeScreenStyles.mockReturnValue(mockStyles);
    mockUseHomeScreenController.mockReturnValue(createController());
  });

  it("builds styles and controller state from theme and user", () => {
    const controller = createController();

    mockUseHomeScreenController.mockReturnValue(controller);

    render(<HomeScreen user={mockUser} />);

    expect(mockUseAppTheme).toHaveBeenCalledTimes(1);
    expect(mockCreateHomeScreenStyles).toHaveBeenCalledWith(mockColors);
    expect(mockUseHomeScreenController).toHaveBeenCalledWith({
      user: mockUser,
    });

    expect(screen.getByText("Good morning, Alex")).toBeTruthy();
    expect(screen.getByText("Wednesday, May 6")).toBeTruthy();
  });

  it("uses dark status bar style for light theme", () => {
    render(<HomeScreen user={mockUser} />);

    expect(mockStatusBar).toHaveBeenCalledWith(
      expect.objectContaining({
        style: "dark",
      }),
    );
  });

  it("uses light status bar style for dark theme", () => {
    mockUseAppTheme.mockReturnValue({
      colors: mockColors,
      isDark: true,
    });

    render(<HomeScreen user={mockUser} />);

    expect(mockStatusBar).toHaveBeenCalledWith(
      expect.objectContaining({
        style: "light",
      }),
    );
  });

  it("passes progress state to HomeProgressCard", () => {
    const controller = createController();

    mockUseHomeScreenController.mockReturnValue(controller);

    render(<HomeScreen user={mockUser} />);

    expect(mockHomeProgressCard).toHaveBeenCalledWith(
      expect.objectContaining({
        styles: mockStyles,
        colors: mockColors,
        progress: controller.progress,
      }),
    );
  });

  it("passes groups state and actions to HomeGroupsSection", () => {
    const controller = createController({
      isLoading: true,
      hasAnyGroups: true,
      hasMoreGroups: true,
    });

    mockUseHomeScreenController.mockReturnValue(controller);

    render(<HomeScreen user={mockUser} />);

    expect(mockHomeGroupsSection).toHaveBeenCalledWith(
      expect.objectContaining({
        styles: mockStyles,
        isLoading: true,
        todayGroups: controller.todayGroups,
        hasAnyGroups: true,
        hasMoreGroups: true,
        onOpenHabits: controller.openHabits,
        onOpenGroupById: controller.openGroupById,
      }),
    );
  });

  it("passes habits state and actions to HomeHabitsSection", () => {
    const controller = createController({
      isLoading: true,
      isSaving: true,
      errorMessage: "Could not load habits",
    });

    mockUseHomeScreenController.mockReturnValue(controller);

    render(<HomeScreen user={mockUser} />);

    expect(mockHomeHabitsSection).toHaveBeenCalledWith(
      expect.objectContaining({
        styles: mockStyles,
        colors: mockColors,
        isLoading: true,
        isSaving: true,
        errorMessage: "Could not load habits",
        todayHabits: controller.todayHabits,
        onOpenHabits: controller.openHabits,
        onOpenHabitById: controller.openHabitById,
        onToggleTodayCompletion: controller.toggleTodayCompletion,
        onRetry: controller.reload,
      }),
    );
  });

  it("passes footer navigation state and action to HomeFooter", () => {
    const controller = createController({
      activeTab: "stats",
    });

    mockUseHomeScreenController.mockReturnValue(controller);

    render(<HomeScreen user={mockUser} />);

    expect(mockHomeFooter).toHaveBeenCalledWith(
      expect.objectContaining({
        activeTab: "stats",
        onTabPress: controller.handleTabPress,
      }),
    );
  });

  it("opens habit creation from the floating action button", () => {
    const controller = createController();

    mockUseHomeScreenController.mockReturnValue(controller);

    render(<HomeScreen user={mockUser} />);

    fireEvent.press(screen.getByLabelText("Create habit"));

    expect(controller.openCreateHabit).toHaveBeenCalledTimes(1);
  });

  it("configures the floating action button icon from theme colors", () => {
    render(<HomeScreen user={mockUser} />);

    expect(mockPlus).toHaveBeenCalledWith(
      expect.objectContaining({
        size: 30,
        color: mockColors.textPrimary,
        strokeWidth: 2.2,
      }),
    );
  });
});
