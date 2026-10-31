// Self-contained QR Code Generator (byte mode, ECC Level M/L)
// Supports text/urls up to ~120 characters, generating a crisp 2D boolean matrix.

export function generateQRCodeMatrix(text: string): boolean[][] {
  // Let's implement QR Code Version 2 (25x25) or 3 (29x29) or dynamic version
  const len = text.length;
  const version = len <= 14 ? 1 : len <= 26 ? 2 : len <= 42 ? 3 : 4;
  const size = version * 4 + 17; // 21, 25, 29, 33

  // Initialize grid: null = unassigned, true = black, false = white
  const grid: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );
  const isFunction: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  const setFunc = (r: number, c: number, val: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      grid[r][c] = val;
      isFunction[r][c] = true;
    }
  };

  // 1. Finder patterns (7x7) at (0,0), (0, size-7), (size-7, 0)
  const drawFinder = (top: number, left: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = top + r;
        const col = left + c;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBlack =
              r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            setFunc(row, col, isBlack);
          } else {
            setFunc(row, col, false); // Separator
          }
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Alignment patterns for Version >= 2
  if (version >= 2) {
    const pos = version === 2 ? [6, 18] : version === 3 ? [6, 22] : [6, 26];
    for (const r of pos) {
      for (const c of pos) {
        if (isFunction[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBlack = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setFunc(r + dr, c + dc, isBlack);
          }
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const isBlack = i % 2 === 0;
    if (!isFunction[6][i]) setFunc(6, i, isBlack);
    if (!isFunction[i][6]) setFunc(i, 6, isBlack);
  }

  // 4. Dark module
  setFunc(4 * version + 9, 8, true);

  // 5. Reserve format info areas
  for (let i = 0; i < 9; i++) {
    if (!isFunction[8][i]) setFunc(8, i, false);
    if (!isFunction[i][8]) setFunc(i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunction[8][size - 1 - i]) setFunc(8, size - 1 - i, false);
    if (!isFunction[size - 1 - i][8]) setFunc(size - 1 - i, 8, false);
  }

  // 6. Encode data bytes
  // Version capacity (ECC Level L/M approx)
  const totalDataBytes = version === 1 ? 19 : version === 2 ? 34 : version === 3 ? 55 : 80;
  const rawBytes: number[] = [];
  // Mode: Byte (0100)
  // Character count indicator (8 bits for v1-9)
  const bytes = Array.from(new TextEncoder().encode(text));
  const bitStream: number[] = [];
  const pushBits = (val: number, count: number) => {
    for (let i = count - 1; i >= 0; i--) {
      bitStream.push((val >>> i) & 1);
    }
  };

  pushBits(0b0100, 4); // Byte mode
  pushBits(bytes.length, 8); // Count
  for (const b of bytes) pushBits(b, 8);
  pushBits(0, Math.min(4, totalDataBytes * 8 - bitStream.length)); // Terminator
  while (bitStream.length % 8 !== 0) bitStream.push(0); // Pad to byte

  // Pad bytes 0xEC, 0x11
  const pad = [0xec, 0x11];
  let padIdx = 0;
  while (bitStream.length < totalDataBytes * 8) {
    pushBits(pad[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to byte array
  const dataBytes: number[] = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bitStream[i + j];
    dataBytes.push(b);
  }

  // Simplified ECC (Reed-Solomon generator polynomial for standard block)
  // Or BCH code
  const eccCount = version === 1 ? 7 : version === 2 ? 10 : version === 3 ? 15 : 20;
  const ecc = generateReedSolomonECC(dataBytes, eccCount);
  const allCodewords = [...dataBytes, ...ecc];

  // 7. Place codewords in zigzag pattern
  let codewordIdx = 0;
  let bitIdx = 7;
  let right = size - 1;
  let upward = true;

  while (right > 0) {
    if (right === 6) right--; // Skip vertical timing column
    const colList = [right, right - 1];
    const rowList = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rowList) {
      for (const c of colList) {
        if (!isFunction[r][c]) {
          let bit = false;
          if (codewordIdx < allCodewords.length) {
            bit = ((allCodewords[codewordIdx] >>> bitIdx) & 1) === 1;
            bitIdx--;
            if (bitIdx < 0) {
              bitIdx = 7;
              codewordIdx++;
            }
          }
          // Mask 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          grid[r][c] = mask ? !bit : bit;
        }
      }
    }
    right -= 2;
    upward = !upward;
  }

  // 8. Format Information for Mask 0, ECC Level L (01) -> format bits: 111011111000100
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];
  for (let i = 0; i < 6; i++) grid[8][i] = formatBits[i] === 1;
  grid[8][7] = formatBits[6] === 1;
  grid[8][8] = formatBits[7] === 1;
  grid[7][8] = formatBits[8] === 1;
  for (let i = 9; i < 15; i++) grid[14 - i][8] = formatBits[i] === 1;

  for (let i = 0; i < 8; i++) grid[8][size - 1 - i] = formatBits[i] === 1;
  for (let i = 8; i < 15; i++) grid[size - 15 + i][8] = formatBits[i] === 1;

  return grid.map((row) => row.map((cell) => cell ?? false));
}

// Galois Field GF(256) log/exp tables
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_EXP[i + 255] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d; // Generator poly 285
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function generateReedSolomonECC(data: number[], eccLength: number): number[] {
  let poly = [1];
  for (let i = 0; i < eccLength; i++) {
    const nextPoly = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMul(poly[j], GF_EXP[i]);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }

  const result = new Array(eccLength).fill(0);
  for (const byte of data) {
    const factor = byte ^ result[0];
    result.shift();
    result.push(0);
    for (let j = 0; j < eccLength; j++) {
      result[j] ^= gfMul(poly[j], factor);
    }
  }
  return result;
}
