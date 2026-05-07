import { fireEvent, render } from "@testing-library/react-native";
import { Image } from "react-native";

import { useAppTheme } from "@/shared/theme";

import { ProfileAvatar } from "../ProfileAvatar";

const mockBlockAvatar = jest.fn((_: unknown) => null);
const mockPencil = jest.fn((_: unknown) => null);

jest.mock("@/shared/theme", () => ({
  useAppTheme: jest.fn(),
}));

jest.mock("../BlockAvatar", () => ({
  BlockAvatar: (props: unknown) => {
    mockBlockAvatar(props);
    return null;
  },
}));

jest.mock("lucide-react-native", () => ({
  Pencil: (props: unknown) => {
    mockPencil(props);
    return null;
  },
}));

const useAppThemeMock = jest.mocked(useAppTheme);

describe("ProfileAvatar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppThemeMock.mockReturnValue({
      colors: {
        border: "#d0d0d0",
        surfaceSecondary: "#efefef",
        accentPrimary: "#66ccaa",
        surface: "#ffffff",
        textPrimary: "#111111",
      },
    } as ReturnType<typeof useAppTheme>);
  });

  it("Given avatar url in read-only mode, When rendering avatar, Then it shows image and skips generated block avatar", () => {
    const { UNSAFE_getByType } = render(
      <ProfileAvatar
        seed="seed-1"
        avatarUrl="https://example.com/avatar.png"
      />,
    );

    expect(UNSAFE_getByType(Image).props.source).toEqual({
      uri: "https://example.com/avatar.png",
    });
    expect(mockBlockAvatar).not.toHaveBeenCalled();
  });

  it("Given editable mode without avatar url, When pressing avatar, Then it renders block fallback and calls edit callback", () => {
    const onPress = jest.fn();
    const { UNSAFE_getByProps } = render(
      <ProfileAvatar
        seed="seed-2"
        avatarUrl={null}
        size={128}
        editable
        onPress={onPress}
      />,
    );

    fireEvent.press(UNSAFE_getByProps({ onPress }));

    expect(mockBlockAvatar).toHaveBeenCalledWith(
      expect.objectContaining({
        seed: "seed-2",
        size: 128,
      }),
    );
    expect(mockPencil).toHaveBeenCalled();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
