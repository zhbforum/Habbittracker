type DeepLinksModule = typeof import("../deepLinks");

function parseWithUrl(url: string): { scheme: string; hostname: string; path: string } {
  const parsed = new URL(url);

  return {
    scheme: parsed.protocol.replace(":", ""),
    hostname: parsed.hostname,
    path: parsed.pathname,
  };
}

async function loadDeepLinks(args: {
  scheme?: string | string[];
  parseImpl?: (url: string) => { scheme: string; hostname: string; path: string };
} = {}): Promise<DeepLinksModule> {
  jest.resetModules();

  const parseMock = jest.fn(args.parseImpl ?? parseWithUrl);

  jest.doMock("expo-linking", () => ({
    parse: parseMock,
  }));

  jest.doMock("expo-constants", () => ({
    __esModule: true,
    default: {
      expoConfig:
        args.scheme === undefined
          ? undefined
          : {
              scheme: args.scheme,
            },
    },
  }));

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("../deepLinks") as DeepLinksModule;
}

describe("deepLinks", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("builds auth callback url from configured scheme string", async () => {
    const deepLinks = await loadDeepLinks({
      scheme: "  MyApp  ",
    });

    expect(deepLinks.getAuthCallbackUrl()).toBe("myapp://auth-callback/");
  });

  it("uses first valid configured scheme from array and falls back to default", async () => {
    const deepLinksFromArray = await loadDeepLinks({
      scheme: ["  ", "PrimaryApp", "secondary-app"],
    });
    expect(deepLinksFromArray.getAuthCallbackUrl()).toBe("primaryapp://auth-callback/");

    const deepLinksFallback = await loadDeepLinks({
      scheme: [],
    });
    expect(deepLinksFallback.getAuthCallbackUrl()).toBe("habbittracker://auth-callback/");
  });

  it("uses default app scheme when config scheme is missing", async () => {
    const deepLinks = await loadDeepLinks();

    expect(deepLinks.getAuthCallbackUrl()).toBe("habbittracker://auth-callback/");
  });

  it("recognizes auth callback urls for host and legacy path", async () => {
    const deepLinks = await loadDeepLinks({
      scheme: ["habbittracker", "backup"],
    });

    expect(deepLinks.isAuthCallbackUrl("HABBITTRACKER://AUTH-CALLBACK/?code=123")).toBe(true);
    expect(deepLinks.isAuthCallbackUrl("backup://auth/callback?state=1")).toBe(true);
  });

  it("rejects urls with unknown scheme or unrelated route", async () => {
    const deepLinks = await loadDeepLinks({
      scheme: "habbittracker",
    });

    expect(deepLinks.isAuthCallbackUrl("otherapp://auth-callback/")).toBe(false);
    expect(deepLinks.isAuthCallbackUrl("habbittracker://profile/settings")).toBe(false);
  });

  it("returns false when url parsing throws", async () => {
    const deepLinks = await loadDeepLinks({
      scheme: "habbittracker",
      parseImpl: () => {
        throw new Error("parse failed");
      },
    });

    expect(deepLinks.isAuthCallbackUrl("habbittracker://auth-callback/")).toBe(false);
  });

  it("returns false when parsed callback url does not include a scheme", async () => {
    const deepLinks = await loadDeepLinks({
      scheme: "habbittracker",
      parseImpl: () => ({
        scheme: "   ",
        hostname: "auth-callback",
        path: "",
      }),
    });

    expect(deepLinks.isAuthCallbackUrl("habbittracker://auth-callback/")).toBe(false);
  });
});
