// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

const FEATURES = [
  "achievements",
  "auth",
  "habits",
  "home",
  "onboarding",
  "profile",
  "root",
  "stats",
];

const FEATURE_CROSS_IMPORT_ALLOWLIST = {
  habits: ["auth"],
  home: ["auth"],
  profile: ["auth"],
  root: ["onboarding"],
  stats: ["auth"],
};

function toFeatureImportPatterns(feature) {
  return [
    `@features/${feature}`,
    `@features/${feature}/*`,
    `@/features/${feature}`,
    `@/features/${feature}/*`,
  ];
}

function toBlockedFeaturePatterns(sourceFeature) {
  const allowedFeatures = new Set([
    sourceFeature,
    ...(FEATURE_CROSS_IMPORT_ALLOWLIST[sourceFeature] ?? []),
  ]);

  return FEATURES.filter((feature) => !allowedFeatures.has(feature))
    .flatMap((feature) => toFeatureImportPatterns(feature));
}

function toAllowedCrossFeatureDeepPatterns(sourceFeature) {
  return (FEATURE_CROSS_IMPORT_ALLOWLIST[sourceFeature] ?? []).flatMap((feature) => [
    `@features/${feature}/*`,
    `@/features/${feature}/*`,
  ]);
}

const FEATURE_BOUNDARY_OVERRIDES = FEATURES.map((feature) => ({
  files: [`src/features/${feature}/**/*.ts`, `src/features/${feature}/**/*.tsx`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          ...toBlockedFeaturePatterns(feature),
          ...toAllowedCrossFeatureDeepPatterns(feature),
        ],
      },
    ],
  },
}));

export default defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "import/no-unresolved": "error",
    },
  },
  {
    files: ["src/entities/**/*.ts", "src/entities/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@features/*",
            "@features/*/*",
            "@/features/*",
            "@/features/*/*",
          ],
        },
      ],
    },
  },
  ...FEATURE_BOUNDARY_OVERRIDES,
]);
