'use server'

import { type LoginField, type LoginInput, loginSchema } from '@/actions/auth/schema'
import type { ActionResult } from '@/actions/types'
import { Role } from '@/generated/prisma/client'
import { createSession } from '@/lib/auth'
import { verifyPassword } from '@/lib/password'
import prisma from '@/lib/prisma'

export async function login(input: LoginInput): Promise<ActionResult<LoginField>> {
  const parsedInput = loginSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsedInput.data.email.toLowerCase(),
    },
  })

  if (!user || user.role !== Role.ADMIN) {
    return {
      message: 'E-mail ou senha inválidos.',
      success: false,
    }
  }

  const isValidPassword = await verifyPassword(parsedInput.data.password, user.password)

  if (!isValidPassword) {
    return {
      message: 'E-mail ou senha inválidos.',
      success: false,
    }
  }

  await createSession({ id: user.id, role: user.role })

  return {
    message: 'Login realizado com sucesso.',
    success: true,
  }
}
