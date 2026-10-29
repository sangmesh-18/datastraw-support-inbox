
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";

const createAdmin = async () => {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password ) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters in .env"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("Admin account ready:", admin);
};

try {
  await createAdmin();
} catch (error) {
  console.error("Failed to create admin:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
