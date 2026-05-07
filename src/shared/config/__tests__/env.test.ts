type EnvModule = typeof import("../env");

const ORIGINAL_ENV = process.env;

function loadEnvModule(args: {
  url?: string | undefined;
  anonKey?: string | undefined;
}): EnvModule {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV };

  if (args.url === undefined) {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
  } else {
    process.env.EXPO_PUBLIC_SUPABASE_URL = args.url;
  }

  if (args.anonKey === undefined) {
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  } else {
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = args.anonKey;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("../env") as EnvModule;
}

describe("shared/config/env", () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.resetModules();
  });

  it("Given trimmed Supabase env vars, When reading runtime config, Then config stores normalized values and no keys are missing", () => {
    const envModule = loadEnvModule({
      url: "  https://project.supabase.co  ",
      anonKey: "  anon-key  ",
    });

    expect(envModule.supabaseRuntimeConfig).toEqual({
      url: "https://project.supabase.co",
      anonKey: "anon-key",
    });
    expect(envModule.getMissingSupabaseEnvKeys()).toEqual([]);
  });

  it("Given empty or whitespace env vars, When reading runtime config, Then config resolves null values and reports both keys as missing", () => {
    const envModule = loadEnvModule({
      url: "   ",
      anonKey: "",
    });

    expect(envModule.supabaseRuntimeConfig).toEqual({
      url: null,
      anonKey: null,
    });
    expect(envModule.getMissingSupabaseEnvKeys()).toEqual([
      "EXPO_PUBLIC_SUPABASE_URL",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    ]);
  });

  it("Given only URL is provided, When resolving missing keys, Then it reports only anon key as missing", () => {
    const envModule = loadEnvModule({
      url: "https://project.supabase.co",
      anonKey: undefined,
    });

    expect(envModule.supabaseRuntimeConfig.url).toBe("https://project.supabase.co");
    expect(envModule.supabaseRuntimeConfig.anonKey).toBeNull();
    expect(envModule.getMissingSupabaseEnvKeys()).toEqual([
      "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    ]);
  });
});
