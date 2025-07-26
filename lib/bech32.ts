import { bech32 } from "bech32"

export function bech32Decode(str: string): { prefix: string; words: number[] } {
  return bech32.decode(str)
}

export function bech32Encode(prefix: string, words: number[]): string {
  return bech32.encode(prefix, words)
}

export function convertBits(data: number[], inBits: number, outBits: number, pad: boolean): number[] {
  return bech32.toWords(data) // This function is typically used for 8-bit to 5-bit conversion for bech32
}

export function npubToHex(npub: string): string | null {
  try {
    const { prefix, words } = bech32Decode(npub)
    if (prefix !== "npub") {
      throw new Error("Invalid npub prefix")
    }
    const data = bech32.fromWords(words)
    return Buffer.from(data).toString("hex")
  } catch (error) {
    console.error("Failed to decode npub:", error)
    return null
  }
}

export function hexToNpub(hex: string): string | null {
  try {
    const data = Buffer.from(hex, "hex")
    const words = bech32.toWords(data)
    return bech32Encode("npub", words)
  } catch (error) {
    console.error("Failed to encode hex to npub:", error)
    return null
  }
}
