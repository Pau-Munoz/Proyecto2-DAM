import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Bulk Seeding with Hashing ---');
  
  const hashedPassword = await bcrypt.hash('1234', 10);

  // 1. Departamentos (3)
  const deps = await Promise.all([
    prisma.departamento.upsert({ where: { nombre: 'Ventas' }, update: {}, create: { nombre: 'Ventas' } }),
    prisma.departamento.upsert({ where: { nombre: 'Marketing' }, update: {}, create: { nombre: 'Marketing' } }),
    prisma.departamento.upsert({ where: { nombre: 'Soporte' }, update: {}, create: { nombre: 'Soporte' } }),
  ]);

  // 2. Estados (4)
  const estados = await Promise.all([
    prisma.estado.upsert({ where: { nombre: 'Prospecto' }, update: {}, create: { nombre: 'Prospecto' } }),
    prisma.estado.upsert({ where: { nombre: 'Contactado' }, update: {}, create: { nombre: 'Contactado' } }),
    prisma.estado.upsert({ where: { nombre: 'En Negociación' }, update: {}, create: { nombre: 'En Negociación' } }),
    prisma.estado.upsert({ where: { nombre: 'Cerrado' }, update: {}, create: { nombre: 'Cerrado' } }),
  ]);

  // 3. Gestores (5)
  const gestores = await Promise.all([
    prisma.gestor.upsert({
      where: { email: 'admin@system.com' },
      update: { contrasena: hashedPassword },
      create: { nombre: 'Carlos', apellidos: 'Admin', email: 'admin@system.com', contrasena: hashedPassword, rol: 'admin', id_departamento: deps[0].id }
    }),
    prisma.gestor.upsert({
      where: { email: 'ana@system.com' },
      update: { contrasena: hashedPassword },
      create: { nombre: 'Ana', apellidos: 'Ventas', email: 'ana@system.com', contrasena: hashedPassword, rol: 'gestor', id_departamento: deps[0].id }
    }),
    prisma.gestor.upsert({
      where: { email: 'pedro@system.com' },
      update: { contrasena: hashedPassword },
      create: { nombre: 'Pedro', apellidos: 'Marketing', email: 'pedro@system.com', contrasena: hashedPassword, rol: 'gestor', id_departamento: deps[1].id }
    }),
    prisma.gestor.upsert({
      where: { email: 'lucia@system.com' },
      update: { contrasena: hashedPassword },
      create: { nombre: 'Lucia', apellidos: 'Soporte', email: 'lucia@system.com', contrasena: hashedPassword, rol: 'gestor', id_departamento: deps[2].id }
    }),
    prisma.gestor.upsert({
      where: { email: 'marcos@system.com' },
      update: { contrasena: hashedPassword },
      create: { nombre: 'Marcos', apellidos: 'Ventas', email: 'marcos@system.com', contrasena: hashedPassword, rol: 'gestor', id_departamento: deps[0].id }
    }),
  ]);

  console.log('--- Bulk Seeding with Hashing Completed ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
