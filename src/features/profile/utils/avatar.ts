type AvatarPalette = {
  background: string;
  primary: string;
  secondary: string;
};

const PALETTES: readonly AvatarPalette[] = [
  {
    background: "#DCEFE1",
    primary: "#4A8060",
    secondary: "#86B79B",
  },
  {
    background: "#E2E8F5",
    primary: "#39597F",
    secondary: "#7F99BE",
  },
  {
    background: "#F3E8D9",
    primary: "#7C5A34",
    secondary: "#C29A6A",
  },
  {
    background: "#EDE3F4",
    primary: "#64457D",
    secondary: "#A488BE",
  },
  {
    background: "#F5E3E7",
    primary: "#7D3E4D",
    secondary: "#BD7B8A",
  },
];

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getAvatarPalette(seed: string): AvatarPalette {
  const hash = hashString(seed);
  const paletteIndex = hash % PALETTES.length;

  return PALETTES[paletteIndex] ?? PALETTES[0];
}

export function buildBlockAvatarMatrix(seed: string, size = 5): boolean[] {
  const seedHash = hashString(seed);
  const halfSize = Math.ceil(size / 2);
  const matrix: boolean[] = [];

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    const rowValues: boolean[] = [];

    for (let columnIndex = 0; columnIndex < halfSize; columnIndex += 1) {
      const bitIndex = (rowIndex * halfSize + columnIndex) % 31;
      const isFilled = ((seedHash >> bitIndex) & 1) === 1;
      rowValues.push(isFilled);
    }

    const mirroredPart = rowValues
      .slice(0, size % 2 === 0 ? rowValues.length : rowValues.length - 1)
      .reverse();
    const fullRow = rowValues.concat(mirroredPart);

    matrix.push(...fullRow);
  }

  return matrix;
}

export function resolveProfileSeed(value: string | null | undefined): string {
  return value?.trim() || "habbittracker-profile";
}

