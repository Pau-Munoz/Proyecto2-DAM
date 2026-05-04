import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  const interests = [
    'Marketing digital',
    'Inversión',
    'Software',
    'Consultoría',
    'Hardware',
    'Diseño UX/UI',
    'E-commerce'
  ];

  console.log('--- SEEDING INTERESTS ---');
  for (const name of interests) {
    await prisma.interes.upsert({
      where: { nombre: name },
      update: {},
      create: { nombre: name }
    });
    console.log(`Interest seeded: ${name}`);
  }
  console.log('Done.');
  await prisma.$disconnect();
}

seed();
