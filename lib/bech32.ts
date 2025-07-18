// Simplified bech32 decoder for npub
// In production, use @scure/base or similar library

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

function polymod(values: number[]): number {
  let chk = 1
  for (const value of values) {
    const top = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ value
    for (let i = 0; i < 5; i++) {
      chk ^= (top >> i) & 1 ? [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3][i] : 0
    }
  }
  return chk
}

function hrpExpand(hrp: string): number[] {
  const ret = []
  for (let p = 0; p < hrp.length; p++) {
    ret.push(hrp.charCodeAt(p) >> 5)
  }
  ret.push(0)
  for (let p = 0; p < hrp.length; p++) {
    ret.push(hrp.charCodeAt(p) & 31)
  }
  return ret
}

function verifyChecksum(hrp: string, data: number[]): boolean {
  return polymod(hrpExpand(hrp).concat(data)) === 1
}

export function bech32Decode(bechString: string): { hrp: string; data: number[] } {
  if (bechString.length < 8 || bechString.length > 90) {
    throw new Error("Invalid bech32 string length")
  }

  const pos = bechString.lastIndexOf("1")
  if (pos < 1 || pos + 7 > bechString.length || pos + 1 + 6 > bechString.length) {
    throw new Error("Invalid bech32 separator position")
  }

  const hrp = bechString.substring(0, pos)
  const data = []

  for (let p = pos + 1; p < bechString.length; p++) {
    const d = CHARSET.indexOf(bechString.charAt(p))
    if (d === -1) {
      throw new Error("Invalid bech32 character")
    }
    data.push(d)
  }

  if (!verifyChecksum(hrp, data)) {
    throw new Error("Invalid bech32 checksum")
  }

  return { hrp, data: data.slice(0, -6) }
}

export function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean): number[] {
  let acc = 0
  let bits = 0
  const ret = []
  const maxv = (1 << toBits) - 1

  for (const value of data) {
    if (value < 0 || value >> fromBits !== 0) {
      throw new Error("Invalid data for base conversion")
    }
    acc = (acc << fromBits) | value
    bits += fromBits
    while (bits >= toBits) {
      bits -= toBits
      ret.push((acc >> bits) & maxv)
    }
  }

  if (pad) {
    if (bits > 0) {
      ret.push((acc << (toBits - bits)) & maxv)
    }
  } else if (bits >= fromBits || (acc << (toBits - bits)) & maxv) {
    throw new Error("Invalid padding in base conversion")
  }

  return ret
}

export function npubToHex(npub: string): string {
  if (!npub.startsWith("npub1")) {
    throw new Error("Invalid npub format")
  }

  try {
    const { hrp, data } = bech32Decode(npub)
    if (hrp !== "npub") {
      throw new Error("Invalid npub prefix")
    }

    const converted = convertBits(data, 5, 8, false)
    return Buffer.from(converted).toString("hex")
  } catch (error) {
    throw new Error(`Failed to decode npub: ${error.message}`)
  }
}
