import { StyleSheet, View } from "react-native";
import { render } from "@testing-library/react-native";

import { PaginationDots } from "../PaginationDots";

describe("PaginationDots", () => {
  it("Given total dots and active index, When rendering dots, Then only active dot receives active style", () => {
    const { UNSAFE_getAllByType } = render(
      <PaginationDots total={4} activeIndex={2} style={{ marginTop: 12 }} />,
    );

    const viewNodes = UNSAFE_getAllByType(View);
    const container = viewNodes[0];
    const dots = viewNodes.slice(1);

    expect(dots).toHaveLength(4);
    expect(container.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ marginTop: 12 })]),
    );

    const flattened = dots.map((dot) => StyleSheet.flatten(dot.props.style));

    expect(flattened[2]).toEqual(expect.objectContaining({ width: 42 }));
    expect(flattened[0]).toEqual(expect.objectContaining({ width: 10 }));
    expect(flattened[1]).toEqual(expect.objectContaining({ width: 10 }));
    expect(flattened[3]).toEqual(expect.objectContaining({ width: 10 }));
  });
});
