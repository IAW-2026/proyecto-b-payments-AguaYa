//  AGREGA ESTO (Instancia directa de Prisma para el script):
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  // Limpiar tablas
  await prisma.payment.deleteMany();
  await prisma.paymentAdmin.deleteMany();

  // Crear admins
  await prisma.paymentAdmin.createMany({
    data: [
      {
        userId: "clerk_admin_1",
        paymentAdminId: "admin_1",
        name: "Agustin Admin",
        createdAt: new Date(),
      },
      {
        userId: "clerk_admin_2",
        paymentAdminId: "admin_2",
        name: "Secondary Admin",
        createdAt: new Date(),
      },
    ],
  });

  // Crear payments
  await prisma.payment.createMany({
    data: [
      {
        orderId: "order_1",
        buyerId: "buyer_1",
        sellerId: "seller_1",
        amount: 15000,
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),

        mpPaymentId: "mp_1001",
        mpStatus: "approved",
        mpPaymentMethod: "visa",
        mpPaymentDate: new Date(),
      },

      {
        orderId: "order_2",
        buyerId: "buyer_2",
        sellerId: "seller_1",
        amount: 8900,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        orderId: "order_3",
        buyerId: "buyer_3",
        sellerId: "seller_2",
        amount: 22000,
        status: "rejected",
        createdAt: new Date(),
        updatedAt: new Date(),

        mpPaymentId: "mp_1002",
        mpStatus: "rejected",
        mpPaymentMethod: "mastercard",
        mpPaymentDate: new Date(),
      },

      {
        orderId: "order_4",
        buyerId: "buyer_4",
        sellerId: "seller_3",
        amount: 12000,
        status: "cancelled",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        orderId: "order_5",
        buyerId: "buyer_5",
        sellerId: "seller_2",
        amount: 30000,
        status: "expired",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
