import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.invoice.deleteMany();
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

  // Payments del mock buyer para que el portal del buyer muestre datos reales
  const mockBuyer = "mock-buyer-abc123";
  const mockSeller = "mock-seller-xyz789";

  const p1 = await prisma.payment.create({
    data: {
      orderId: "order_mock_1",
      buyerId: mockBuyer,
      buyerName: "Juan Pérez",
      buyerEmail: "juan@mail.com",
      sellerId: mockSeller,
      sellerName: "Vendedor AguaYa",
      amount: 12100,
      status: "approved",
      mpPaymentId: "mp_mock_1",
      mpStatus: "approved",
      mpPaymentMethod: "visa",
      mpPaymentDate: new Date("2026-05-10"),
      items: {
        create: [
          { productName: "Bidón 20L", quantity: 2, unitPrice: 4500, subtotal: 9000 },
          { productName: "Agua 5L", quantity: 4, unitPrice: 800, subtotal: 3200 },
        ],
      },
    },
  });

  const p2 = await prisma.payment.create({
    data: {
      orderId: "order_mock_2",
      buyerId: mockBuyer,
      buyerName: "Juan Pérez",
      buyerEmail: "juan@mail.com",
      sellerId: mockSeller,
      sellerName: "Vendedor AguaYa",
      amount: 5500,
      status: "approved",
      mpPaymentId: "mp_mock_2",
      mpStatus: "approved",
      mpPaymentMethod: "mastercard",
      mpPaymentDate: new Date("2026-05-20"),
      items: {
        create: [
          { productName: "Agua 10L", quantity: 1, unitPrice: 5500, subtotal: 5500 },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: "order_mock_3",
      buyerId: mockBuyer,
      buyerName: "Juan Pérez",
      buyerEmail: "juan@mail.com",
      sellerId: mockSeller,
      sellerName: "Vendedor AguaYa",
      amount: 3200,
      status: "pending",
      items: {
        create: [
          { productName: "Bidón 10L", quantity: 2, unitPrice: 1600, subtotal: 3200 },
        ],
      },
    },
  });

  // Facturas para los pagos aprobados
  for (const payment of [p1, p2]) {
    const total = payment.amount;
    const subtotal = Math.round(total / 1.21);
    const tax = total - subtotal;
    await prisma.invoice.create({
      data: {
        paymentId: payment.id,
        subtotal,
        tax,
        total,
        issuedAt: payment.mpPaymentDate ?? new Date(),
      },
    });
  }

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
