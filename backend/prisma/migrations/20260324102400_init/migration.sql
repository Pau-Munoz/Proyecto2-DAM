-- CreateTable
CREATE TABLE "Gestor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sector" TEXT,
    "gestorId" INTEGER NOT NULL,
    CONSTRAINT "Empresa_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "Gestor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contacto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "empresaId" INTEGER NOT NULL,
    CONSTRAINT "Contacto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empresaId" INTEGER NOT NULL,
    CONSTRAINT "Mensaje_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Log" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gestorId" INTEGER NOT NULL,
    CONSTRAINT "Log_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "Gestor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EmpresaToInteres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EmpresaToInteres_A_fkey" FOREIGN KEY ("A") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EmpresaToInteres_B_fkey" FOREIGN KEY ("B") REFERENCES "Interes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Gestor_email_key" ON "Gestor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Interes_name_key" ON "Interes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_EmpresaToInteres_AB_unique" ON "_EmpresaToInteres"("A", "B");

-- CreateIndex
CREATE INDEX "_EmpresaToInteres_B_index" ON "_EmpresaToInteres"("B");
