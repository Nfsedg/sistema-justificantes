import { prisma } from '../lib/prisma'

async function main() {
  await prisma.workflow.create({
  data: {
    nombre: "Justificantes Default",
    etapas: {
      create: [
        {
          nombre: "Tutor",
          orden: 1,
          tipo: "SECUENCIAL"
        },
        {
          nombre: "Profesores",
          orden: 2,
          tipo: "PARALELA"
        }
      ]
    }
  }
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