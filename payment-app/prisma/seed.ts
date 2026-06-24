import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MOCK_BUYER_ID = process.env.MOCK_BUYER_ID ?? "mock-buyer-abc123";
const MOCK_SELLER_ID = process.env.MOCK_SELLER_ID ?? "mock-seller-xyz789";
const CLERK_USER = process.env.SEED_CLERK_USER ?? "mock-clerk-user";

function mAgo(months: number): Date {
  const d = new Date();
  d.setDate(15);
  d.setHours(10, 0, 0, 0);
  d.setMonth(d.getMonth() - months);
  return d;
}

type Item = { productName: string; quantity: number; unitPrice: number };

async function createApproved(opts: {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  mpPaymentMethod: string;
  createdAt: Date;
  items: Item[];
}) {
  const amount = opts.items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0,
  );

  const payment = await prisma.payment.create({
    data: {
      orderId: opts.orderId,
      buyerId: MOCK_BUYER_ID,
      buyerName: opts.buyerName,
      buyerEmail: opts.buyerEmail,
      sellerId: MOCK_SELLER_ID,
      sellerName: "Vendedor AguaYa",
      amount,
      status: "approved",
      mpPaymentId: `mp-${opts.orderId}`,
      mpStatus: "approved",
      mpPaymentMethod: opts.mpPaymentMethod,
      mpPaymentDate: opts.createdAt,
      createdAt: opts.createdAt,
      items: {
        create: opts.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.quantity * i.unitPrice,
        })),
      },
    },
  });

  const total = amount;
  const subtotal = Math.round(total / 1.21);
  const tax = total - subtotal;

  await prisma.invoice.create({
    data: {
      paymentId: payment.id,
      subtotal,
      tax,
      total,
      issuedAt: opts.createdAt,
    },
  });
}

async function main() {
  // ── Cleanup ────────────────────────────────────────────
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.paymentUser.deleteMany();

  // ── PaymentUser ────────────────────────────────────────
  await prisma.paymentUser.createMany({
    data: [
      {
        clerkId: CLERK_USER,
        buyerId: MOCK_BUYER_ID,
        buyerName: "Juan Pérez",
        sellerId: MOCK_SELLER_ID,
        sellerName: "Juan Pérez",
      },
      {
        clerkId: "mock-clerk-buyer-only",
        buyerId: "ext-buyer-only-1",
        buyerName: "María García",
      },
      {
        clerkId: "mock-clerk-seller-only",
        sellerId: "ext-seller-only-1",
        sellerName: "Distribuidora Sur",
      },
      {
        clerkId: "mock-clerk-suspended",
        buyerId: "ext-buyer-susp",
        buyerName: "Usuario Suspendido",
        status: "SUSPENDED",
      },
      {
        clerkId: "mock-clerk-deleted",
        buyerId: "ext-buyer-del",
        buyerName: "Usuario Eliminado",
        status: "DELETED",
      },
    ],
  });

  // ── Approved payments — distribuidos en 12 meses ───────
  // Bidón 20L: top revenue  (13 unidades × $4500 = $58 500)
  // Agua 5L:   más vendido  (22 unidades × $800  = $17 600)

  await createApproved({
    orderId: "order-a-01",
    buyerName: "Juan Pérez",
    buyerEmail: "juan@mail.com",
    mpPaymentMethod: "visa",
    createdAt: mAgo(11),
    items: [{ productName: "Bidón 20L", quantity: 2, unitPrice: 4500 }],
  });
  await createApproved({
    orderId: "order-a-02",
    buyerName: "María García",
    buyerEmail: "maria@mail.com",
    mpPaymentMethod: "mastercard",
    createdAt: mAgo(10),
    items: [
      { productName: "Agua 5L", quantity: 4, unitPrice: 800 },
      { productName: "Dispensador", quantity: 1, unitPrice: 3200 },
    ],
  });
  await createApproved({
    orderId: "order-a-03",
    buyerName: "Carlos López",
    buyerEmail: "carlos@mail.com",
    mpPaymentMethod: "visa",
    createdAt: mAgo(9),
    items: [{ productName: "Agua 10L", quantity: 3, unitPrice: 5500 }],
  });
  await createApproved({
    orderId: "order-a-04",
    buyerName: "Juan Pérez",
    buyerEmail: "juan@mail.com",
    mpPaymentMethod: "debin",
    createdAt: mAgo(8),
    items: [
      { productName: "Bidón 20L", quantity: 1, unitPrice: 4500 },
      { productName: "Agua 5L", quantity: 2, unitPrice: 800 },
    ],
  });
  await createApproved({
    orderId: "order-a-05",
    buyerName: "María García",
    buyerEmail: "maria@mail.com",
    mpPaymentMethod: "mastercard",
    createdAt: mAgo(7),
    items: [{ productName: "Dispensador", quantity: 2, unitPrice: 3200 }],
  });
  await createApproved({
    orderId: "order-a-06",
    buyerName: "Carlos López",
    buyerEmail: "carlos@mail.com",
    mpPaymentMethod: "visa",
    createdAt: mAgo(6),
    items: [{ productName: "Bidón 20L", quantity: 3, unitPrice: 4500 }],
  });
  await createApproved({
    orderId: "order-a-07",
    buyerName: "Juan Pérez",
    buyerEmail: "juan@mail.com",
    mpPaymentMethod: "visa",
    createdAt: mAgo(5),
    items: [{ productName: "Agua 10L", quantity: 2, unitPrice: 5500 }],
  });
  await createApproved({
    orderId: "order-a-08",
    buyerName: "María García",
    buyerEmail: "maria@mail.com",
    mpPaymentMethod: "mastercard",
    createdAt: mAgo(4),
    items: [
      { productName: "Bidón 20L", quantity: 2, unitPrice: 4500 },
      { productName: "Agua 5L", quantity: 6, unitPrice: 800 },
    ],
  });
  await createApproved({
    orderId: "order-a-09",
    buyerName: "Carlos López",
    buyerEmail: "carlos@mail.com",
    mpPaymentMethod: "debin",
    createdAt: mAgo(3),
    items: [{ productName: "Agua 5L", quantity: 10, unitPrice: 800 }],
  });
  await createApproved({
    orderId: "order-a-10",
    buyerName: "Juan Pérez",
    buyerEmail: "juan@mail.com",
    mpPaymentMethod: "visa",
    createdAt: mAgo(2),
    items: [{ productName: "Bidón 20L", quantity: 4, unitPrice: 4500 }],
  });
  await createApproved({
    orderId: "order-a-11",
    buyerName: "María García",
    buyerEmail: "maria@mail.com",
    mpPaymentMethod: "mastercard",
    createdAt: mAgo(1),
    items: [
      { productName: "Dispensador", quantity: 1, unitPrice: 3200 },
      { productName: "Agua 10L", quantity: 1, unitPrice: 5500 },
    ],
  });
  await createApproved({
    orderId: "order-a-12",
    buyerName: "Carlos López",
    buyerEmail: "carlos@mail.com",
    mpPaymentMethod: "visa",
    createdAt: mAgo(0),
    items: [{ productName: "Bidón 20L", quantity: 1, unitPrice: 4500 }],
  });

  // ── Otros estados ──────────────────────────────────────
  await prisma.payment.createMany({
    data: [
      {
        orderId: "order-p-01",
        buyerId: MOCK_BUYER_ID,
        buyerName: "Juan Pérez",
        buyerEmail: "juan@mail.com",
        sellerId: MOCK_SELLER_ID,
        sellerName: "Vendedor AguaYa",
        amount: 3200,
        status: "pending",
        createdAt: mAgo(0),
      },
      {
        orderId: "order-r-01",
        buyerId: MOCK_BUYER_ID,
        buyerName: "María García",
        buyerEmail: "maria@mail.com",
        sellerId: MOCK_SELLER_ID,
        sellerName: "Vendedor AguaYa",
        amount: 5500,
        status: "rejected",
        mpPaymentId: "mp-rej-01",
        mpStatus: "rejected",
        mpPaymentMethod: "mastercard",
        mpPaymentDate: mAgo(2),
        createdAt: mAgo(2),
      },
      {
        orderId: "order-c-01",
        buyerId: MOCK_BUYER_ID,
        buyerName: "Carlos López",
        buyerEmail: "carlos@mail.com",
        sellerId: MOCK_SELLER_ID,
        sellerName: "Vendedor AguaYa",
        amount: 800,
        status: "cancelled",
        createdAt: mAgo(3),
      },
      {
        orderId: "order-e-01",
        buyerId: MOCK_BUYER_ID,
        buyerName: "Juan Pérez",
        buyerEmail: "juan@mail.com",
        sellerId: MOCK_SELLER_ID,
        sellerName: "Vendedor AguaYa",
        amount: 4500,
        status: "expired",
        createdAt: mAgo(5),
      },
    ],
  });

  console.log("✓ Seed completado:");
  console.log("  - 5 PaymentUsers");
  console.log("  - 12 payments aprobados en 12 meses + 4 en otros estados");
  console.log("  - 12 invoices generadas");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
