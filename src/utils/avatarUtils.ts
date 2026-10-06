// Deterministic avatar and gravatar-style icon generators for Church Members

// Simple fast MD5 implementation for Gravatar compatibility
function md5Cycle(x: number[], k: number[]): void {
  let a = x[0], b = x[1], c = x[2], d = x[3];

  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682);
  d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290);
  b = ff(b, c, d, a, k[15], 22, 1236535329);

  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);
  b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335);
  b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961);
  b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473);
  b = gg(b, c, d, a, k[12], 20, -1926607734);

  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);
  b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632);
  b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174);
  d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979);
  b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520);
  b = hh(b, c, d, a, k[2], 23, -995338651);

  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905);
  b = ii(b, c, d, a, k[5], 21, -57434055);
  a = ii(a, b, c, d, k[12], 6, 1700485571);
  d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523);
  b = ii(b, c, d, a, k[1], 21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359);
  d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380);
  b = ii(b, c, d, a, k[13], 21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070);
  d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259);
  b = ii(b, c, d, a, k[9], 21, -343485551);

  x[0] = add32(a, x[0]);
  x[1] = add32(b, x[1]);
  x[2] = add32(c, x[2]);
  x[3] = add32(d, x[3]);
}

function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
  a = add32(add32(a, q), add32(x, t));
  return add32((a << s) | (a >>> (32 - s)), b);
}

function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return cmn((b & c) | (~b & d), a, b, x, s, t);
}

function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return cmn((b & d) | (c & ~d), a, b, x, s, t);
}

function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return cmn(c ^ (b | ~d), a, b, x, s, t);
}

function add32(a: number, b: number): number {
  return (a + b) & 0xffffffff;
}

export function md5(str: string): string {
  const txt = unescape(encodeURIComponent(str));
  const n = txt.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;
  for (i = 64; i <= n; i += 64) {
    md5Cycle(state, md5Blks(txt.substring(i - 64, i)));
  }
  const tail = txt.substring(i - 64);
  const tailBytes: number[] = [];
  for (let j = 0; j < tail.length; j++) {
    tailBytes[j] = tail.charCodeAt(j);
  }
  tailBytes[tail.length] = 0x80;
  while (tailBytes.length % 64 !== 56) {
    tailBytes.push(0);
  }
  const tailWords: number[] = [];
  for (let j = 0; j < 56; j += 4) {
    tailWords.push(
      tailBytes[j] |
      (tailBytes[j + 1] << 8) |
      (tailBytes[j + 2] << 16) |
      (tailBytes[j + 3] << 24)
    );
  }
  tailWords.push(n * 8);
  tailWords.push(0);
  md5Cycle(state, tailWords);

  let hex = "";
  for (let j = 0; j < 4; j++) {
    for (let k = 0; k < 4; k++) {
      const b = (state[j] >>> (k * 8)) & 0xff;
      hex += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return hex;
}

function md5Blks(s: string): number[] {
  const blks: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    blks.push(
      s.charCodeAt(i) |
      (s.charCodeAt(i + 1) << 8) |
      (s.charCodeAt(i + 2) << 16) |
      (s.charCodeAt(i + 3) << 24)
    );
  }
  return blks;
}

// Deterministic number generator from string seed
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Palettes for geometric identicons
const IDENTICON_PALETTES = [
  { fg: "#D4AF37", bg: "#0D1B3E", accent: "#E5BF48" }, // Navy & Gold (Liturgical Royal)
  { fg: "#6366F1", bg: "#0F172A", accent: "#818CF8" }, // Indigo Sanctuary
  { fg: "#10B981", bg: "#064E3B", accent: "#34D399" }, // Emerald Revival
  { fg: "#EC4899", bg: "#831843", accent: "#F472B6" }, // Rose Grace
  { fg: "#F59E0B", bg: "#78350F", accent: "#FBBF24" }, // Amber Anointing
  { fg: "#8B5CF6", bg: "#2E1065", accent: "#A78BFA" }, // Purple Majesty
  { fg: "#06B6D4", bg: "#164E63", accent: "#22D3EE" }, // Cyan Living Waters
  { fg: "#EF4444", bg: "#7F1D1D", accent: "#F87171" }, // Crimson Covenant
];

/**
 * Generates an SVG Identicon (data:image/svg+xml) - 5x5 symmetrical block matrix.
 * 100% offline, highly visual, deterministic gravatar-style icon.
 */
export function generateGeometricIdenticon(seed: string): string {
  const cleanSeed = (seed || "member").trim().toLowerCase();
  const hash = hashCode(cleanSeed);
  const palette = IDENTICON_PALETTES[hash % IDENTICON_PALETTES.length];

  // 5x5 grid with symmetry: columns 0, 1, 2 determine columns 4, 3, 2
  const grid: boolean[][] = [];
  let seedValue = hash;

  for (let row = 0; row < 5; row++) {
    grid[row] = [];
    const c0 = (seedValue & (1 << (row * 3))) !== 0;
    const c1 = (seedValue & (1 << (row * 3 + 1))) !== 0;
    const c2 = (seedValue & (1 << (row * 3 + 2))) !== 0;

    grid[row][0] = c0;
    grid[row][1] = c1;
    grid[row][2] = c2;
    grid[row][3] = c1; // Symmetrical
    grid[row][4] = c0; // Symmetrical
  }

  const cellSize = 16;
  const padding = 10;
  const size = cellSize * 5 + padding * 2;

  let rects = "";
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (grid[r][c]) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${palette.fg}" />`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">
    <rect width="${size}" height="${size}" rx="12" fill="${palette.bg}" />
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.3" fill="none" />
    ${rects}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns a Gravatar URL using MD5 email hash with customizable default fallback style.
 */
export function getGravatarUrl(
  email: string, 
  style: "identicon" | "retro" | "robohash" | "wavatar" | "monsterid" = "identicon"
): string {
  const cleanEmail = (email || "user@faithflow.org").trim().toLowerCase();
  const hash = md5(cleanEmail);
  return `https://www.gravatar.com/avatar/${hash}?d=${style}&s=160`;
}

/**
 * Returns a DiceBear avatar URL (bottts, avataaars, identicon, adventurer).
 */
export function getDicebearUrl(
  seed: string, 
  style: "identicon" | "bottts" | "avataaars" | "lorelei" | "fun-emoji" = "identicon"
): string {
  const cleanSeed = encodeURIComponent((seed || "member").trim().toLowerCase());
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${cleanSeed}`;
}

/**
 * Resolves the display avatar for a congregation member:
 * Returns uploaded photo, gravatar URL, or generated SVG identicon.
 */
export function getMemberAvatar(member: {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  avatarType?: string;
}): string {
  if (member.avatarUrl && member.avatarUrl.trim() !== "") {
    return member.avatarUrl;
  }

  const seed = member.email || member.name || member.id || "disciple";
  return generateGeometricIdenticon(seed);
}

/**
 * Helper to compress and convert an uploaded File to a compact base64 data URL
 * so it easily fits within Firestore document size limits.
 */
export function processUploadedImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file must be an image."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG 0.8
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error("Unable to decode uploaded image."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}
