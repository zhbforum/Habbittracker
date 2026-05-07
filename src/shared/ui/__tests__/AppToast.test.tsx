import type { ReactElement } from "react";
import { render } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import type { ToastConfig } from "react-native-toast-message";

import { lightColors } from "@/shared/theme";

import {
  AppToastHost,
  hideAppToast,
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "../AppToast";

jest.mock("react-native-toast-message", () => {
  const ToastMock = jest.fn(() => null) as jest.Mock & {
    show: jest.Mock;
    hide: jest.Mock;
  };
  ToastMock.show = jest.fn();
  ToastMock.hide = jest.fn();

  return {
    __esModule: true,
    default: ToastMock,
    BaseToast: jest.fn(() => null),
  };
});

const toastMock = Toast as unknown as jest.Mock & {
  show: jest.Mock;
  hide: jest.Mock;
};

type ToastElement = ReactElement<{
  text2NumberOfLines: number;
  style: unknown;
}>;

function getRenderedToastConfig(): ToastConfig {
  const call = toastMock.mock.calls[0]?.[0];

  if (!call?.config) {
    throw new Error("Expected Toast to be rendered with config.");
  }

  return call.config as ToastConfig;
}

describe("AppToast", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given success toast payload, When showing success toast, Then it uses top position defaults and success visibility timeout", () => {
    showSuccessToast("Saved", "Changes applied.");

    expect(toastMock.show).toHaveBeenCalledWith({
      type: "success",
      position: "top",
      autoHide: true,
      topOffset: 52,
      visibilityTime: 2400,
      text1: "Saved",
      text2: "Changes applied.",
    });
  });

  it("Given error toast without message, When showing error toast, Then it uses error visibility timeout and omits text2", () => {
    showErrorToast("Unable to save");

    const payload = toastMock.show.mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      type: "error",
      position: "top",
      autoHide: true,
      topOffset: 52,
      visibilityTime: 3200,
      text1: "Unable to save",
    });
    expect(payload).not.toHaveProperty("text2");
  });

  it("Given info toast payload, When showing info toast, Then it uses shared non-error visibility timeout", () => {
    showInfoToast("Theme updated", "Dark mode enabled.");

    expect(toastMock.show).toHaveBeenCalledWith({
      type: "info",
      position: "top",
      autoHide: true,
      topOffset: 52,
      visibilityTime: 2400,
      text1: "Theme updated",
      text2: "Dark mode enabled.",
    });
  });

  it("Given active toast, When hiding toast, Then it delegates to toast hide API", () => {
    hideAppToast();

    expect(toastMock.hide).toHaveBeenCalledTimes(1);
  });

  it("Given toast host render, When reading toast config variants, Then each variant applies expected theme accent colors", () => {
    render(<AppToastHost />);

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "top",
        topOffset: 52,
        visibilityTime: 2400,
        autoHide: true,
        swipeable: true,
      }),
      undefined,
    );

    const config = getRenderedToastConfig();
    const successElement = config.success?.({} as never) as ToastElement | undefined;
    const errorElement = config.error?.({} as never) as ToastElement | undefined;
    const infoElement = config.info?.({} as never) as ToastElement | undefined;

    expect(successElement?.props.text2NumberOfLines).toBe(3);
    expect(errorElement?.props.text2NumberOfLines).toBe(3);
    expect(infoElement?.props.text2NumberOfLines).toBe(3);

    expect(successElement?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          borderLeftColor: lightColors.successText,
        }),
      ]),
    );
    expect(errorElement?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          borderLeftColor: lightColors.errorText,
        }),
      ]),
    );
    expect(infoElement?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          borderLeftColor: lightColors.accentText,
        }),
      ]),
    );
  });
});
