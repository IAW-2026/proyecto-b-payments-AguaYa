import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.payment.deleteMany();
  await prisma.paymentAdmin.deleteMany();

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

  await prisma.payment.create({
    data: {
      orderId: "order_1",
      buyerId: "buyer_1",
      buyerName: "Juan Pérez",
      buyerEmail: "juan@mail.com",
      sellerId: "seller_1",
      sellerName: "Vendedor AguaYa",
      amount: 1000,
      status: "approved",
      mpPaymentId: "mp_1001",
      mpStatus: "approved",
      mpPaymentMethod: "visa",
      mpPaymentDate: new Date(),
      items: {
        create: [
          {
            productId: "prod_1",
            productName: "Agua 5L",
            productImageUrl: "https://picsum.photos/seed/agua/200/300",
            quantity: 2,
            unitPrice: 500,
            subtotal: 1000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: "order_2",
      buyerId: "buyer_2",
      buyerName: "María García",
      buyerEmail: "maria@mail.com",
      sellerId: "seller_1",
      sellerName: "Vendedor AguaYa",
      amount: 1500,
      status: "pending",
      items: {
        create: [
          {
            productId: "prod_2",
            productName: "Agua 10L",
            productImageUrl: "https://picsum.photos/seed/agua10/200/300",
            quantity: 3,
            unitPrice: 500,
            subtotal: 1500,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: "order_3",
      buyerId: "buyer_3",
      buyerName: "Carlos López",
      buyerEmail: "carlos@mail.com",
      sellerId: "seller_2",
      sellerName: "Distribuidora Sur",
      amount: 2000,
      status: "rejected",
      mpPaymentId: "mp_1002",
      mpStatus: "rejected",
      mpPaymentMethod: "mastercard",
      mpPaymentDate: new Date(),
      items: {
        create: [
          {
            productId: "prod_1",
            productName: "Agua 5L",
            productImageUrl: "https://picsum.photos/seed/agua/200/300",
            quantity: 4,
            unitPrice: 500,
            subtotal: 2000,
          },
        ],
      },
    },
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
