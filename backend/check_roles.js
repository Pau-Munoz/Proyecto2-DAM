import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const gestores = await prisma.gestor.findMany({
    select: {
      id: true,
      email: true,
      rol: true
    }
  });
  console.log(JSON.stringify(gestores, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
