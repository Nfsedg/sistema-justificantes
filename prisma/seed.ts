import { prisma } from '../lib/prisma'

async function main() {
    await prisma.role.createMany({
    data: [
      { name: "STUDENT" },
      { name: "TEACHER" },
      { name: "COORD" },
    ],
  })

  console.log('Roles seeded successfully.')
}

main()
  .catch((e) => {
    console.error('Error seeding roles:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })