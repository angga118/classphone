import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString:
    process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Users ---
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const userPasswordHash = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gadgethub.test" },
    update: {
      notificationEnabled: true,
    },
    create: {
      name: "Admin GadgetHub",
      email: "admin@gadgethub.test",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      phone: "6281234567890",
      address: "Jakarta, Indonesia",
      notificationEnabled: true,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: "user@gadgethub.test" },
    update: {
      notificationEnabled: true,
    },
    create: {
      name: "User GadgetHub",
      email: "user@gadgethub.test",
      passwordHash: userPasswordHash,
      role: "USER",
      phone: "6289876543210",
      address: "Bandung, Indonesia",
      notificationEnabled: true,
    },
  });

  console.log("Seeded users:", admin.email, regularUser.email);

  // --- Settings ---
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {
      adminWhatsappNumber: "6281234567890",
      messageTemplateJual:
        "Halo Admin, saya ingin menjual {nama_hp} (ID Listing: {kode}) dengan harga estimasi Rp {harga}. Mohon info langkah selanjutnya.",
      messageTemplateBeli:
        "Halo Admin, saya ingin beli {nama_hp} (Kode: {kode}) seharga Rp {harga}. Apakah masih tersedia?",
    },
    create: {
      id: "default",
      adminWhatsappNumber: "6281234567890",
      messageTemplateJual:
        "Halo Admin, saya ingin menjual {nama_hp} (ID Listing: {kode}) dengan harga estimasi Rp {harga}. Mohon info langkah selanjutnya.",
      messageTemplateBeli:
        "Halo Admin, saya ingin beli {nama_hp} (Kode: {kode}) seharga Rp {harga}. Apakah masih tersedia?",
    },
  });

  console.log("Seeded settings");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });