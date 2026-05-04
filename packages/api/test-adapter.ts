import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient({ log: ["error"] });
const adapter = prismaAdapter(prisma);

async function main() {
  try {
    const user = await adapter.createUser({
      email: "test-adapter@example.com",
      name: "Test Adapter",
    });
    console.log("SUCCESS:", user);
  } catch (e: any) {
    console.error("ERROR:", e.message);
    console.error("Code:", e.code);
    console.error("Meta:", JSON.stringify(e.meta));
    console.error("Cause:", e.cause?.message);
  }
  await prisma.$disconnect();
}
main();
