import type { ThemeColors } from "@shared/theme";

import { createHomeGroupsStyles } from "../homeGroupsStyles";

const colors = {
  border: "#111111",
  surface: "#222222",
  surfaceSecondary: "#333333",

  textPrimary: "#444444",
  textSecondary: "#555555",
  textMuted: "#666666",

  accentText: "#777777",
  accentPrimary: "#888888",

  successText: "#009900",
} as unknown as ThemeColors;

describe("createHomeGroupsStyles", () => {
  it("returns the full style contract used by the home groups section", () => {
    const styles = createHomeGroupsStyles(colors);

    expect(Object.keys(styles).sort()).toEqual(
      [
        "groupSectionWrap",
        "groupSectionHeader",
        "groupSectionTitle",
        "groupSectionAction",
        "groupLoaderCard",
        "groupLoaderText",
        "groupEmptyCard",
        "groupEmptyTitle",
        "groupEmptySubtitle",
        "groupEmptyActionButton",
        "groupEmptyActionText",
        "groupListWrap",
        "groupCard",
        "groupCardHeader",
        "groupIconWrap",
        "groupIdentityWrap",
        "groupName",
        "groupDescription",
        "groupMetaRow",
        "groupMetaChip",
        "groupMetaText",
        "groupProgressRow",
        "groupProgressCaption",
        "groupProgressPercent",
        "groupProgressTrack",
        "groupProgressFill",
        "groupProgressFillDone",
        "groupHint",
      ].sort(),
    );
  });

  it("maps theme colors to the section container and header actions", () => {
    const styles = createHomeGroupsStyles(colors);

    expect(styles.groupSectionWrap).toMatchObject({
      borderColor: colors.border,
      backgroundColor: colors.surface,
    });

    expect(styles.groupSectionTitle).toMatchObject({
      color: colors.textPrimary,
    });

    expect(styles.groupSectionAction).toMatchObject({
      color: colors.accentText,
    });

    expect(styles.groupSectionHeader).toMatchObject({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    });
  });

  it("keeps loading and empty states visually consistent", () => {
    const styles = createHomeGroupsStyles(colors);

    expect(styles.groupLoaderCard).toMatchObject({
      minHeight: 72,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
    });

    expect(styles.groupLoaderText).toMatchObject({
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    });

    expect(styles.groupEmptyCard).toMatchObject({
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 7,
    });

    expect(styles.groupEmptyTitle).toMatchObject({
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 21,
    });

    expect(styles.groupEmptySubtitle).toMatchObject({
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    });

    expect(styles.groupEmptyActionButton).toMatchObject({
      alignSelf: "flex-start",
      minHeight: 32,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
    });

    expect(styles.groupEmptyActionText).toMatchObject({
      color: colors.textPrimary,
      fontSize: 12,
      lineHeight: 16,
    });
  });

  it("keeps group card layout and identity styles stable", () => {
    const styles = createHomeGroupsStyles(colors);

    expect(styles.groupListWrap).toMatchObject({
      gap: 8,
    });

    expect(styles.groupCard).toMatchObject({
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 8,
    });

    expect(styles.groupCardHeader).toMatchObject({
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    });

    expect(styles.groupIconWrap).toMatchObject({
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    });

    expect(styles.groupIdentityWrap).toMatchObject({
      flex: 1,
    });

    expect(styles.groupName).toMatchObject({
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 21,
    });

    expect(styles.groupDescription).toMatchObject({
      marginTop: 1,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    });
  });

  it("keeps metadata chips readable and wrap-friendly", () => {
    const styles = createHomeGroupsStyles(colors);

    expect(styles.groupMetaRow).toMatchObject({
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    });

    expect(styles.groupMetaChip).toMatchObject({
      minHeight: 28,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    });

    expect(styles.groupMetaText).toMatchObject({
      color: colors.textPrimary,
      fontSize: 11,
      lineHeight: 15,
    });
  });

  it("keeps progress bar layout and completion colors stable", () => {
    const styles = createHomeGroupsStyles(colors);

    expect(styles.groupProgressRow).toMatchObject({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    });

    expect(styles.groupProgressCaption).toMatchObject({
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    });

    expect(styles.groupProgressPercent).toMatchObject({
      color: colors.textPrimary,
      fontSize: 12,
      lineHeight: 16,
    });

    expect(styles.groupProgressTrack).toMatchObject({
      width: "100%",
      height: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: "hidden",
    });

    expect(styles.groupProgressFill).toMatchObject({
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.accentPrimary,
    });

    expect(styles.groupProgressFillDone).toMatchObject({
      backgroundColor: colors.successText,
    });
  });

  it("uses muted text color for the group hint", () => {
    const styles = createHomeGroupsStyles(colors);

    expect(styles.groupHint).toMatchObject({
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 15,
    });
  });
});