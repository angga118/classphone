-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "completeness" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "askingPrice" REAL,
    "dealPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("adminNote", "askingPrice", "brand", "completeness", "condition", "createdAt", "id", "model", "photos", "status", "storage", "updatedAt", "userId") SELECT "adminNote", "askingPrice", "brand", "completeness", "condition", "createdAt", "id", "model", "photos", "status", "storage", "updatedAt", "userId" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE INDEX "Listing_userId_idx" ON "Listing"("userId");
CREATE INDEX "Listing_status_idx" ON "Listing"("status");
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "adminWhatsappNumber" TEXT NOT NULL DEFAULT '6281234567890',
    "messageTemplateJual" TEXT NOT NULL DEFAULT 'Halo Admin, saya ingin menjual {nama_hp} (ID Listing: {kode}) dengan harga estimasi Rp {harga}. Mohon info langkah selanjutnya.',
    "messageTemplateBeli" TEXT NOT NULL DEFAULT 'Halo Admin, saya ingin beli {nama_hp} (Kode: {kode}) seharga Rp {harga}. Apakah masih tersedia?',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Settings" ("adminWhatsappNumber", "id", "messageTemplateBeli", "messageTemplateJual", "updatedAt") SELECT "adminWhatsappNumber", "id", "messageTemplateBeli", "messageTemplateJual", "updatedAt" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;