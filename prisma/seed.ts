import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient, Role } from '../src/generated/prisma/client'
import { hashPassword } from '../src/lib/password'

const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@vanillato.local'
const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123456'
const adminName = process.env.ADMIN_NAME ?? 'Administrador'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  const hashedPassword = await hashPassword(adminPassword)

  await prisma.user.upsert({
    create: {
      email: adminEmail.toLowerCase(),
      name: adminName,
      password: hashedPassword,
      role: Role.ADMIN,
    },
    update: {
      name: adminName,
      role: Role.ADMIN,
    },
    where: {
      email: adminEmail.toLowerCase(),
    },
  })

  const paymentMethods = ['Pix', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito']

  await Promise.all(
    paymentMethods.map((name) =>
      prisma.paymentMethod.upsert({
        create: {
          name,
        },
        update: {
          isActive: true,
        },
        where: {
          name,
        },
      }),
    ),
  )
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
