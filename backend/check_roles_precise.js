import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const gestores = await prisma.gestor.findMany();
  gestores.forEach(g => {
    console.log(`ID: ${g.id}, Email: ${g.email}, Rol: [${g.rol}], Length: ${g.rol?.length}`);
  });
}

main().finally(() => prisma.$disconnect());
