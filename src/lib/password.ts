import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const PASSWORD_KEY_LENGTH = 64
const PASSWORD_SALT_LENGTH = 16
const PASSWORD_HASH_PREFIX = 'scrypt'

export async function hashPassword(password: string) {
  const salt = randomBytes(PASSWORD_SALT_LENGTH).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, PASSWORD_KEY_LENGTH)) as Buffer

  return `${PASSWORD_HASH_PREFIX}:${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, storedPassword: string) {
  const [prefix, salt, storedHash] = storedPassword.split(':')

  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !storedHash) {
    return false
  }

  const storedBuffer = Buffer.from(storedHash, 'hex')
  const derivedKey = (await scryptAsync(password, salt, storedBuffer.length)) as Buffer

  return timingSafeEqual(storedBuffer, derivedKey)
}
