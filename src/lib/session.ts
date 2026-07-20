import { z } from 'zod'

import { Role } from '@/generated/prisma/enums'
import { env } from '@/lib/env'

export const SESSION_COOKIE_NAME = 'vanillato_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

const sessionPayloadSchema = z.object({
  expiresAt: z.number().int().positive(),
  role: z.enum([Role.ADMIN, Role.USER]),
  userId: z.string().min(1),
})

export type SessionPayload = z.infer<typeof sessionPayloadSchema>

export function createSessionPayload(user: { id: string; role: Role }): SessionPayload {
  return {
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    role: user.role,
    userId: user.id,
  }
}

export async function signSessionPayload(payload: SessionPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = await createSignature(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = await createSignature(encodedPayload)

  if (!constantTimeEqual(signature, expectedSignature)) {
    return null
  }

  const decodedPayload = decodeBase64Url(encodedPayload)

  if (!decodedPayload) {
    return null
  }

  const parsedPayload = sessionPayloadSchema.safeParse(JSON.parse(decodedPayload) as unknown)

  if (!parsedPayload.success || parsedPayload.data.expiresAt <= Date.now()) {
    return null
  }

  return parsedPayload.data
}

async function createSignature(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.AUTH_SECRET),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))

  return bytesToBase64Url(new Uint8Array(signature))
}

function encodeBase64Url(value: string) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '')
}

function decodeBase64Url(value: string) {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)

    return atob(`${base64}${padding}`)
  } catch {
    return null
  }
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '')
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false
  }

  let result = 0

  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return result === 0
}
