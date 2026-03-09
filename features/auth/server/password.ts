import "server-only"

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)
const SALT_BYTES = 16
const KEY_LENGTH = 64

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES).toString("hex")
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer

  return `scrypt$${salt}$${derivedKey.toString("hex")}`
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedHash] = storedHash.split("$")

  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false
  }

  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  const expectedBuffer = Buffer.from(expectedHash, "hex")

  if (expectedBuffer.length !== derivedKey.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, derivedKey)
}
