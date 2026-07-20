import { z } from 'zod'

const envSchema = z.object({
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must have at least 32 characters'),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .url('DATABASE_URL must be a valid connection URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  throw new Error(`Invalid environment variables:\n${formattedErrors}`)
}

export const env = parsedEnv.data
