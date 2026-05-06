import { getSupabaseClient } from "@/shared/api/supabase/client";

import { uploadAvatarFromDevice } from "../profileAvatar";

jest.mock("@/shared/api/supabase/client", () => ({
  getSupabaseClient: jest.fn(),
}));

const getSupabaseClientMock = getSupabaseClient as jest.MockedFunction<
  typeof getSupabaseClient
>;

type FetchResponseLike = {
  ok: boolean;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function createFetchResponse(args: {
  ok?: boolean;
  bytes?: number;
}): FetchResponseLike {
  const byteLength = args.bytes ?? 128;

  return {
    ok: args.ok ?? true,
    arrayBuffer: async () => new Uint8Array(byteLength).buffer,
  };
}

function createSupabaseStorageMock(args?: {
  uploadErrorMessage?: string | null;
  publicUrl?: string | null;
}) {
  const upload = jest.fn().mockResolvedValue({
    error: args?.uploadErrorMessage
      ? {
          message: args.uploadErrorMessage,
        }
      : null,
  });

  const getPublicUrl = jest.fn().mockReturnValue({
    data: {
      publicUrl:
        args?.publicUrl ?? "https://cdn.example.com/avatars/user-1/avatar.jpg",
    },
  });

  const from = jest.fn().mockReturnValue({
    upload,
    getPublicUrl,
  });

  getSupabaseClientMock.mockReturnValue({
    storage: {
      from,
    },
  } as unknown as ReturnType<typeof getSupabaseClient>);

  return {
    from,
    upload,
    getPublicUrl,
  };
}

describe("profileAvatar", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  it("Given unsupported uri scheme, When uploading avatar, Then it throws invalid source error", async () => {
    await expect(
      uploadAvatarFromDevice("user-1", "https://example.com/avatar.jpg"),
    ).rejects.toThrow("Invalid avatar source.");

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("Given fetch cannot read selected image, When uploading avatar, Then it throws read error", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      createFetchResponse({
        ok: false,
      }),
    );

    await expect(
      uploadAvatarFromDevice("user-2", "file:///storage/avatar.png"),
    ).rejects.toThrow("Unable to read selected image.");
  });

  it("Given unsupported file extension, When uploading avatar, Then it throws format validation error", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(createFetchResponse({}));

    await expect(
      uploadAvatarFromDevice("user-3", "file:///storage/avatar.gif"),
    ).rejects.toThrow(
      "Unsupported avatar format. Please use JPG, PNG, or WEBP.",
    );
  });

  it("Given oversized avatar file, When uploading avatar, Then it throws size validation error", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      createFetchResponse({
        bytes: 5 * 1024 * 1024 + 1,
      }),
    );

    await expect(
      uploadAvatarFromDevice("user-4", "file:///storage/avatar.webp"),
    ).rejects.toThrow("Avatar is too large. Maximum supported size is 5MB.");
  });

  it("Given Supabase upload fails, When uploading avatar, Then it throws upload error message", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(createFetchResponse({}));

    createSupabaseStorageMock({
      uploadErrorMessage: "storage upload failed",
    });

    await expect(
      uploadAvatarFromDevice("user-5", "file:///storage/avatar.png"),
    ).rejects.toThrow("storage upload failed");
  });

  it("Given uploaded file has no public URL, When uploading avatar, Then it throws URL resolution error", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(createFetchResponse({}));

    createSupabaseStorageMock({
      publicUrl: "",
    });

    await expect(
      uploadAvatarFromDevice("user-6", "file:///storage/avatar.png"),
    ).rejects.toThrow("Unable to get avatar URL after upload.");
  });

  it("Given valid local JPEG file, When uploading avatar, Then it uploads with normalized mime type and returns public URL", async () => {
    jest.spyOn(Date, "now").mockReturnValue(1_721_000_000_000);
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);

    (globalThis.fetch as jest.Mock).mockResolvedValue(createFetchResponse({}));

    const supabase = createSupabaseStorageMock({
      publicUrl: "https://cdn.example.com/avatars/user-7/profile.jpg",
    });

    const result = await uploadAvatarFromDevice(
      "user-7",
      "file:///storage/path/avatar.JPEG?version=2",
    );

    expect(supabase.from).toHaveBeenCalledWith("avatars");

    expect(supabase.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^user-7\/\d+-[a-z0-9]{6}\.jpg$/),
      expect.any(ArrayBuffer),
      {
        contentType: "image/jpeg",
        upsert: false,
      },
    );

    expect(result).toBe("https://cdn.example.com/avatars/user-7/profile.jpg");
  });
});
