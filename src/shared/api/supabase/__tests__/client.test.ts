type ClientModule = typeof import("../client");

function loadClientModule(args: {
  os: "ios" | "android" | "web";
  missingEnvKeys?: string[];
  url?: string;
  anonKey?: string;
}): {
  clientModule: ClientModule;
  createClient: jest.Mock;
  getMissingSupabaseEnvKeys: jest.Mock;
  nativeSupabaseStorage: Record<string, unknown>;
  processLock: Record<string, unknown>;
} {
  jest.resetModules();

  const createClient = jest.fn(() => ({ __client: "supabase-client" }));
  const processLock = { __lock: "process-lock" };
  const getMissingSupabaseEnvKeys = jest
    .fn()
    .mockReturnValue(args.missingEnvKeys ?? []);
  const nativeSupabaseStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };

  jest.doMock("@supabase/supabase-js", () => ({
    createClient,
    processLock,
  }));

  jest.doMock("react-native-url-polyfill/auto", () => ({}));

  jest.doMock("react-native", () => ({
    Platform: {
      OS: args.os,
    },
  }));

  jest.doMock("@/shared/config/env", () => ({
    supabaseRuntimeConfig: {
      url: args.url ?? "https://project.supabase.co",
      anonKey: args.anonKey ?? "anon-key",
    },
    getMissingSupabaseEnvKeys,
  }));

  jest.doMock("@/shared/api/supabase/storage", () => ({
    nativeSupabaseStorage,
  }));

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clientModule = require("../client") as ClientModule;

  return {
    clientModule,
    createClient,
    getMissingSupabaseEnvKeys,
    nativeSupabaseStorage,
    processLock,
  };
}

describe("shared/api/supabase/client", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("Given missing Supabase env keys, When requesting client, Then it throws clear configuration error and skips client creation", () => {
    const loaded = loadClientModule({
      os: "ios",
      missingEnvKeys: ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_ANON_KEY"],
    });

    expect(() => loaded.clientModule.getSupabaseClient()).toThrow(
      "Missing Supabase env vars: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY",
    );
    expect(loaded.getMissingSupabaseEnvKeys).toHaveBeenCalledTimes(1);
    expect(loaded.createClient).not.toHaveBeenCalled();
  });

  it("Given native platform with valid env keys, When requesting client twice, Then it creates one cached client with native storage config", () => {
    const loaded = loadClientModule({
      os: "ios",
    });

    const first = loaded.clientModule.getSupabaseClient();
    const second = loaded.clientModule.getSupabaseClient();

    expect(first).toBe(second);
    expect(loaded.getMissingSupabaseEnvKeys).toHaveBeenCalledTimes(1);
    expect(loaded.createClient).toHaveBeenCalledTimes(1);
    expect(loaded.createClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "anon-key",
      {
        auth: {
          storage: loaded.nativeSupabaseStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          lock: loaded.processLock,
        },
      },
    );
  });

  it("Given web platform with valid env keys, When requesting client, Then it omits native storage from auth configuration", () => {
    const loaded = loadClientModule({
      os: "web",
    });

    loaded.clientModule.getSupabaseClient();

    const thirdArg = loaded.createClient.mock.calls[0]?.[2] as {
      auth: Record<string, unknown>;
    };
    expect(thirdArg.auth).toEqual({
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: loaded.processLock,
    });
    expect(thirdArg.auth).not.toHaveProperty("storage");
  });
});
