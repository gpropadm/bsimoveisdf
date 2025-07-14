-- AlterTable
ALTER TABLE "properties" ADD COLUMN "parking" INTEGER;

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'ImobiNext',
    "siteDescription" TEXT NOT NULL DEFAULT 'Encontre o imóvel dos seus sonhos',
    "contactEmail" TEXT NOT NULL DEFAULT 'contato@imobinext.com',
    "contactPhone" TEXT NOT NULL DEFAULT '(48) 99864-5864',
    "contactWhatsapp" TEXT NOT NULL DEFAULT '5548998645864',
    "address" TEXT NOT NULL DEFAULT 'Rua das Flores, 123',
    "city" TEXT NOT NULL DEFAULT 'Florianópolis',
    "state" TEXT NOT NULL DEFAULT 'SC',
    "socialFacebook" TEXT NOT NULL DEFAULT 'https://facebook.com',
    "socialInstagram" TEXT NOT NULL DEFAULT 'https://instagram.com',
    "socialLinkedin" TEXT NOT NULL DEFAULT 'https://linkedin.com',
    "featuredLimit" INTEGER NOT NULL DEFAULT 6,
    "enableRegistrations" BOOLEAN NOT NULL DEFAULT true,
    "enableComments" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
