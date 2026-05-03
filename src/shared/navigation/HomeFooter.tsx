import {
  ChartColumn,
  House,
  List,
  UserRound,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ThemeColors } from "@/shared/theme";
import { useAppTheme } from "@/shared/theme";
import { AppText } from "@/shared/ui";

export type HomeTabId = "home" | "habits" | "stats" | "profile";

type HomeFooterItem = {
  id: HomeTabId;
  label: string;
  Icon: LucideIcon;
};

const FOOTER_ITEMS: readonly HomeFooterItem[] = [
  {
    id: "home",
    label: "Home",
    Icon: House,
  },
  {
    id: "habits",
    label: "Habits",
    Icon: List,
  },
  {
    id: "stats",
    label: "Stats",
    Icon: ChartColumn,
  },
  {
    id: "profile",
    label: "Profile",
    Icon: UserRound,
  },
];

type HomeFooterProps = {
  activeTab?: HomeTabId;
  onTabPress?: (tabId: HomeTabId) => void;
};

export function HomeFooter({ activeTab = "home", onTabPress }: HomeFooterProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {FOOTER_ITEMS.map((item) => {
        const isActive = item.id === activeTab;
        const tintColor = isActive ? colors.textPrimary : colors.textMuted;

        return (
          <Pressable
            key={item.id}
            style={styles.tabButton}
            onPress={() => onTabPress?.(item.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <item.Icon
              size={22}
              color={tintColor}
              strokeWidth={isActive ? 2.2 : 2}
            />
            <AppText style={[styles.tabLabel, { color: tintColor }]}>
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      width: "100%",
      borderTopWidth: 1,
      borderTopColor: colors.accentSecondary,
      paddingTop: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background,
    },
    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingVertical: 6,
    },
    tabLabel: {
      fontSize: 12,
      lineHeight: 16,
    },
  });
}
