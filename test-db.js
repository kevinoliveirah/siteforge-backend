const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão bem sucedida!');
    const users = await prisma.user.findMany();
    console.log(`Encontrados ${users.length} usuários.`);
  } catch (e) {
    console.error('❌ Erro de conexão:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
