import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient, Role } from '../src/generated/prisma/client'
import { hashPassword } from '../src/lib/password'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
})

const admins = [
  {
    email: 'lucas@dev.local.com',
    name: 'Lucas Gonçalves',
    password: '11a16b22c.',
  },
  {
    email: 'claudiane@adm.local.com',
    name: 'Claudiane Oliczyk',
    password: 'Leticia40',
  },
  {
    email: 'eliezer@adm.local.com',
    name: 'Eliezer',
    password: 'Leticia41',
  },
]

async function main() {
  for (const admin of admins) {
    const hashedPassword = await hashPassword(admin.password)

    await prisma.user.upsert({
      where: {
        email: admin.email.toLowerCase(),
      },
      create: {
        email: admin.email.toLowerCase(),
        name: admin.name,
        password: hashedPassword,
        role: Role.ADMIN,
      },
      update: {
        name: admin.name,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    })

    console.log(`✔ Admin criado/atualizado: ${admin.email}`)
  }

  const paymentMethods = ['Pix', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito']

  await Promise.all(
    paymentMethods.map((name) =>
      prisma.paymentMethod.upsert({
        where: {
          name,
        },
        create: {
          name,
        },
        update: {
          isActive: true,
        },
      }),
    ),
  )

  console.log('✔ Formas de pagamento criadas/atualizadas.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
