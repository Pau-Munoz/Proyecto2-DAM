import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

async function main() {
  const email = 'admin@system.com';
  const gestor = await prisma.gestor.findUnique({ where: { email } });
  
  if (!gestor) {
    console.log('Admin user not found');
    return;
  }

  console.log('Gestor from DB Rol:', gestor.rol);

  const token = jwt.sign({ id: gestor.id, email: gestor.email, rol: gestor.rol }, JWT_SECRET, { expiresIn: '8h' });
  const decoded = jwt.verify(token, JWT_SECRET);
  
  console.log('Decoded Rol:', decoded.rol);
  console.log('Match with "admin":', decoded.rol === 'admin');
}

main().finally(() => prisma.$disconnect());
