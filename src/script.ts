import { prisma } from "./lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  // Create a new user
  const hashedPassword = await bcrypt.hash("Password123", 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Alice",
      lastName: "Johnson",
      othername: "AJ",
      email: "alice@resivana.io",
      password: hashedPassword,
      role: "AGENT",
      isAdmin: false,
      profilePics:
        "https://res.cloudinary.com/djoahpirg/image/upload/v1745277187/wepadt9fizw8vlmnqiyz.jpg",
      isOnline: true,
      agent: {
        create: {
          fullName: "Alice Johnson",
          email: "alice.agent@resivana.io",
          phone: "+1234567890",
          bankCode: "001",
          accountNumber: "1234567890",
          accountName: "Alice Johnson Business",
        },
      },
    },
    include: {
      agent: true,
      properties: true,
      reviews: true,
    },
  });
  console.log("Created user:", JSON.stringify(user, null, 2));

  // Fetch all users with related data
  const allUsers = await prisma.user.findMany({
    include: {
      agent: true,
      properties: true,
      agentBookings: true,
      customerBookings: true,
      conversations: true,
      messages: true,
      reviews: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
