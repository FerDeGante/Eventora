// prisma/seeders/02_users.js
const bcrypt = require("bcrypt");
const { prisma } = require("../_utils");

module.exports = async function seedUsers() {
  const hash = await bcrypt.hash("eventoraadmin25", 10);
  await prisma.user.upsert({
    where: { email: "ferdegante.22@gmail.com" },
    update: { role: "ADMIN", password: hash, name: "Fernando De Gante" },
    create: {
      email:    "ferdegante.22@gmail.com",
      name:     "Fernando De Gante",
      password: hash,
      role:     "ADMIN",
      phone:    "7770001111",
    },
  });
  console.log("✅ Seed: Users");
};