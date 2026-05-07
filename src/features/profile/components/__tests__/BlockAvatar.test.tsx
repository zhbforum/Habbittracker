import { StyleSheet, View } from "react-native";
import { render } from "@testing-library/react-native";

import { buildBlockAvatarMatrix, getAvatarPalette, resolveProfileSeed } from "../../utils/avatar";
import { BlockAvatar } from "../BlockAvatar";

describe("BlockAvatar", () => {
  it("Given default size, When rendering block avatar, Then it creates 5x5 deterministic tile grid", () => {
    const seed = "alex";
    const { UNSAFE_getAllByType } = render(<BlockAvatar seed={seed} />);
    const nodes = UNSAFE_getAllByType(View).filter((node) => node.props.style);
    const container = nodes[0];
    const tileNodes = nodes.slice(1);
    const resolvedSeed = resolveProfileSeed(seed);
    const matrix = buildBlockAvatarMatrix(resolvedSeed, 5);
    const palette = getAvatarPalette(resolvedSeed);

    expect(tileNodes).toHaveLength(25);
    expect(StyleSheet.flatten(container.props.style)).toEqual(
      expect.objectContaining({
        width: 96,
        height: 96,
        borderRadius: 25,
      }),
    );

    tileNodes.forEach((tileNode, tileIndex) => {
      const tileStyle = StyleSheet.flatten(tileNode.props.style);
      const isFilled = matrix[tileIndex];

      expect(tileStyle.backgroundColor).toBe(isFilled ? palette.primary : palette.secondary);
      expect(tileStyle.opacity).toBe(isFilled ? 1 : 0.5);
    });
  });

  it("Given custom size, When rendering block avatar, Then it scales container and tile geometry to provided size", () => {
    const customSize = 120;
    const { UNSAFE_getAllByType } = render(<BlockAvatar seed="custom-seed" size={customSize} />);
    const nodes = UNSAFE_getAllByType(View).filter((node) => node.props.style);
    const container = StyleSheet.flatten(nodes[0].props.style);
    const firstTile = StyleSheet.flatten(nodes[1].props.style);

    expect(container.width).toBe(customSize);
    expect(container.height).toBe(customSize);
    expect(container.borderRadius).toBe(Math.round(customSize * 0.26));
    expect(firstTile.width).toBeGreaterThan(0);
    expect(firstTile.height).toBeGreaterThan(0);
    expect(firstTile.borderRadius).toBeGreaterThanOrEqual(2);
  });
});
