// prisma/seeders/03_therapists.js
const bcrypt = require("bcrypt");
const { prisma } = require("../_utils");

module.exports = async function seedTherapists() {
  const therapists = [
    { name: "María de la Luz Espíndola Aranda", specialty: "Fisioterapeuta", email: "maria.espindola@bloom.com" },
    { name: "Jesús Ramírez Espíndola", specialty: "Quiropráctica", email: "jesus.ramirez@bloom.com" },
    { name: "Gisela Calderón García", specialty: "Cosmetologa", email: "gisela.calderon@bloom.com" },
    { name: "Rosa Isela Paredes Ortiz", specialty: "Fisioterapeuta", email: "rosaisela.paredes@bloom.com" },
    { name: "Alitzel Scanda Pacheco Sanchez", specialty: "Fisioterapeuta", email: "alitzel.pacheco@bloom.com" },
    { name: "Rosalinda Salgado Salas", specialty: "Fisioterapeuta", email: "rosalinda.salgado@bloom.com" },
    { name: "Beatriz Victoria Ortiz Guerrero", specialty: "Preparación física", email: "beatriz.ortiz@bloom.com" },
    { name: "Gustavo Ángel Aguilar Ocampo", specialty: "Nutriólogo", email: "gustavo.aguilar@bloom.com" },
    { name: "Miguel Ramírez Espíndola", specialty: "Fisioterapeuta", email: "miguel.ramirez@bloom.com" },
    { name: "Angela García Zuazo", specialty: "Fisioterapeuta", email: "angela.garcia@bloom.com" },
    { name: "Sebastián Rosas Vences", specialty: "Fisioterapeuta", email: "sebastian.rosas@bloom.com" }
  ];

  for (const { name, specialty, email } of therapists) {
    try {
      // 1. Upsert para usuario
      const passwordHash = await bcrypt.hash("eventoraTherapist123", 10);
      const user = await prisma.user.upsert({
        where: { email },
        update: { name, password: passwordHash, role: "THERAPIST" },
        create: { name, email, password: passwordHash, role: "THERAPIST" },
      });

      // 2. Upsert para terapeuta (relacionado con usuario)
      await prisma.therapist.upsert({
        where: { userId: user.id },
        update: { specialty },
        create: { userId: user.id, specialty },
      });
    } catch (error) {
      console.error(`Error procesando terapeuta ${name}:`, error.message);
    }
  }

  console.log(`✅ Seed: ${therapists.length} therapists procesados.`);
};