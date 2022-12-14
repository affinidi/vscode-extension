import crypto from 'crypto'

export namespace randomUtils {
  export function getPseudonymousStringHash(
    s: string,
    encoding: crypto.BinaryToTextEncoding = 'base64',
  ): string {
    return crypto.createHash('sha256').update(s).digest(encoding)
  }

  export function getRandomHexString(length: number = 6): string {
    const buffer: Buffer = crypto.randomBytes(Math.ceil(length / 2))
    return buffer.toString('hex').slice(0, length)
  }
}
