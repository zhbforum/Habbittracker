import * as ImagePicker from "expo-image-picker";

import { pickAvatarFromGallery } from "../profileGalleryPicker";

const requestMediaLibraryPermissionsAsyncMock =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.MockedFunction<
    typeof ImagePicker.requestMediaLibraryPermissionsAsync
  >;
const launchImageLibraryAsyncMock =
  ImagePicker.launchImageLibraryAsync as jest.MockedFunction<
    typeof ImagePicker.launchImageLibraryAsync
  >;

describe("profileGalleryPicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Given gallery permission is denied, When picking avatar, Then it returns permission_denied and does not open picker", async () => {
    requestMediaLibraryPermissionsAsyncMock.mockResolvedValueOnce({
      granted: false,
    } as never);

    const result = await pickAvatarFromGallery();

    expect(result).toEqual({
      status: "permission_denied",
    });
    expect(launchImageLibraryAsyncMock).not.toHaveBeenCalled();
  });

  it("Given permission is granted and user cancels picker, When picking avatar, Then it returns cancelled state", async () => {
    requestMediaLibraryPermissionsAsyncMock.mockResolvedValueOnce({
      granted: true,
    } as never);
    launchImageLibraryAsyncMock.mockResolvedValueOnce({
      canceled: true,
      assets: null,
    } as never);

    const result = await pickAvatarFromGallery();

    expect(result).toEqual({
      status: "cancelled",
    });
  });

  it("Given picker returns asset without uri, When picking avatar, Then it returns invalid_asset", async () => {
    requestMediaLibraryPermissionsAsyncMock.mockResolvedValueOnce({
      granted: true,
    } as never);
    launchImageLibraryAsyncMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{}],
    } as never);

    const result = await pickAvatarFromGallery();

    expect(result).toEqual({
      status: "invalid_asset",
    });
  });

  it("Given picker returns image asset with uri, When picking avatar, Then it returns success and uses square crop picker options", async () => {
    requestMediaLibraryPermissionsAsyncMock.mockResolvedValueOnce({
      granted: true,
    } as never);
    launchImageLibraryAsyncMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///avatar/new-profile.png" }],
    } as never);

    const result = await pickAvatarFromGallery();

    expect(launchImageLibraryAsyncMock).toHaveBeenCalledWith({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    expect(result).toEqual({
      status: "success",
      uri: "file:///avatar/new-profile.png",
    });
  });
});
