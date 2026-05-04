/*
  Warnings:

  - You are about to drop the `_EmpresaToInteres` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `empresaId` on the `Contacto` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Contacto` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Contacto` table. All the data in the column will be lost.
  - You are about to drop the column `gestorId` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `sector` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Gestor` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Interes` table. All the data in the column will be lost.
  - You are about to drop the column `action` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `gestorId` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Mensaje` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Mensaje` table. All the data in the column will be lost.
  - You are about to drop the column `empresaId` on the `Mensaje` table. All the data in the column will be lost.
  - Added the required column `creado_por` to the `Contacto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresa_id` to the `Contacto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_completo` to the `Contacto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creado_por` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado_id` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellidos` to the `Gestor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contrasena` to the `Gestor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_departamento` to the `Gestor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Gestor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Interes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descripcion` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gestor_id` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresa_id` to the `Mensaje` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gestor_id` to the `Mensaje` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mensaje` to the `Mensaje` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_EmpresaToInteres_B_index";

-- DropIndex
DROP INDEX "_EmpresaToInteres_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_EmpresaToInteres";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Departamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Estado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EmpresaIntereses" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EmpresaIntereses_A_fkey" FOREIGN KEY ("A") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EmpresaIntereses_B_fkey" FOREIGN KEY ("B") REFERENCES "Interes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contacto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empresa_id" INTEGER NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "cargo" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "fecha_alta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_por" INTEGER NOT NULL,
    CONSTRAINT "Contacto_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contacto_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "Gestor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Contacto" ("email", "id") SELECT "email", "id" FROM "Contacto";
DROP TABLE "Contacto";
ALTER TABLE "new_Contacto" RENAME TO "Contacto";
CREATE TABLE "new_Empresa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "fecha_alta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_id" INTEGER NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "web" TEXT,
    "convenio" BOOLEAN NOT NULL DEFAULT false,
    "fecha_convenio" DATETIME,
    "creado_por" INTEGER NOT NULL,
    CONSTRAINT "Empresa_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "Estado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Empresa_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "Gestor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Empresa" ("id") SELECT "id" FROM "Empresa";
DROP TABLE "Empresa";
ALTER TABLE "new_Empresa" RENAME TO "Empresa";
CREATE TABLE "new_Gestor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'gestor',
    "id_departamento" INTEGER NOT NULL,
    CONSTRAINT "Gestor_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "Departamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Gestor" ("email", "id") SELECT "email", "id" FROM "Gestor";
DROP TABLE "Gestor";
ALTER TABLE "new_Gestor" RENAME TO "Gestor";
CREATE UNIQUE INDEX "Gestor_email_key" ON "Gestor"("email");
CREATE TABLE "new_Interes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);
INSERT INTO "new_Interes" ("id") SELECT "id" FROM "Interes";
DROP TABLE "Interes";
ALTER TABLE "new_Interes" RENAME TO "Interes";
CREATE UNIQUE INDEX "Interes_nombre_key" ON "Interes"("nombre");
CREATE TABLE "new_Log" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gestor_id" INTEGER NOT NULL,
    "empresa_id" INTEGER,
    "mensaje_id" INTEGER,
    "descripcion" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Log_gestor_id_fkey" FOREIGN KEY ("gestor_id") REFERENCES "Gestor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Log_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Log_mensaje_id_fkey" FOREIGN KEY ("mensaje_id") REFERENCES "Mensaje" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Log" ("id") SELECT "id" FROM "Log";
DROP TABLE "Log";
ALTER TABLE "new_Log" RENAME TO "Log";
CREATE TABLE "new_Mensaje" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empresa_id" INTEGER NOT NULL,
    "gestor_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'normal',
    "mensaje" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fijado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Mensaje_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mensaje_gestor_id_fkey" FOREIGN KEY ("gestor_id") REFERENCES "Gestor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mensaje" ("id") SELECT "id" FROM "Mensaje";
DROP TABLE "Mensaje";
ALTER TABLE "new_Mensaje" RENAME TO "Mensaje";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_nombre_key" ON "Departamento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Estado_nombre_key" ON "Estado"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "_EmpresaIntereses_AB_unique" ON "_EmpresaIntereses"("A", "B");

-- CreateIndex
CREATE INDEX "_EmpresaIntereses_B_index" ON "_EmpresaIntereses"("B");
