import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding...");

  // Create doctor account
  const doctorEmail = "dokter@medpredict.com";
  const doctorPassword = "dokter123";
  
  // Check if doctor already exists
  const existingDoctor = await prisma.user.findUnique({
    where: { email: doctorEmail },
  });

  if (existingDoctor) {
    console.log("✅ Doctor account already exists:", doctorEmail);
  } else {
    const hashedPassword = await bcrypt.hash(doctorPassword, 10);
    
    const doctor = await prisma.user.create({
      data: {
        email: doctorEmail,
        password: hashedPassword,
        name: "Dr. Siti Rahmawati",
        phone: process.env.WHAT_PHONE_NUMBER || "628989861351",
        role: "doctor",
      },
    });

    console.log("✅ Doctor account created successfully!");
    console.log("   Email:", doctorEmail);
    console.log("   Password:", doctorPassword);
    console.log("   Name:", doctor.name);
    console.log("   ID:", doctor.id);
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
