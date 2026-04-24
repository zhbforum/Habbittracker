import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { buildBlockAvatarMatrix, getAvatarPalette, resolveProfileSeed } from "../utils/avatar";

type BlockAvatarProps = {
  seed: string;
  size?: number;
};

const GRID_SIZE = 5;

export function BlockAvatar({ seed, size = 96 }: BlockAvatarProps) {
  const resolvedSeed = resolveProfileSeed(seed);
  const matrix = useMemo(
    () => buildBlockAvatarMatrix(resolvedSeed, GRID_SIZE),
    [resolvedSeed],
  );
  const palette = useMemo(() => getAvatarPalette(resolvedSeed), [resolvedSeed]);

  const innerPadding = Math.max(6, Math.round(size * 0.12));
  const gap = Math.max(2, Math.round(size * 0.02));
  const tileSize = (size - innerPadding * 2 - gap * (GRID_SIZE - 1)) / GRID_SIZE;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.26),
          backgroundColor: palette.background,
          padding: innerPadding,
          gap,
        },
      ]}
    >
      {matrix.map((isFilled, tileIndex) => (
        <View
          key={`profile-avatar-tile-${tileIndex}`}
          style={{
            width: tileSize,
            height: tileSize,
            borderRadius: Math.max(2, Math.round(tileSize * 0.24)),
            backgroundColor: isFilled ? palette.primary : palette.secondary,
            opacity: isFilled ? 1 : 0.5,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
  },
});

