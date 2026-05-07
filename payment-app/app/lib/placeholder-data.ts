import type { Payment, Payment_Admin } from "./definitions";

export const payments: Payment[] = [
  {
    payment_id: "pay_001",
    order_id: "order_1001",
    buyer_id: "buyer_001",
    seller_id: "seller_001",
    amount: 2500,
    payment_status: "pending",
    created_at: new Date("2026-05-01T10:00:00Z"),
    updated_at: new Date("2026-05-01T10:00:00Z"),
    mp_payment_id: "MP_0001",
    mp_status: "pending",
    mp_payment_method: "credit_card",
    mp_payment_date: new Date("2026-05-01T10:05:00Z"),
  },
  {
    payment_id: "pay_002",
    order_id: "order_1002",
    buyer_id: "buyer_002",
    seller_id: "seller_001",
    amount: 7800,
    payment_status: "approved",
    created_at: new Date("2026-05-02T12:30:00Z"),
    updated_at: new Date("2026-05-02T12:45:00Z"),
    mp_payment_id: "MP_0002",
    mp_status: "approved",
    mp_payment_method: "bank_transfer",
    mp_payment_date: new Date("2026-05-02T12:40:00Z"),
  },
  {
    payment_id: "pay_003",
    order_id: "order_1003",
    buyer_id: "buyer_003",
    seller_id: "seller_002",
    amount: 1500,
    payment_status: "rejected",
    created_at: new Date("2026-05-03T08:20:00Z"),
    updated_at: new Date("2026-05-03T08:25:00Z"),
    mp_payment_id: "MP_0003",
    mp_status: "rejected",
    mp_payment_method: "debit_card",
    mp_payment_date: new Date("2026-05-03T08:22:00Z"),
  },
];

export const admins: Payment_Admin[] = [
  {
    clerk_user_id: "clerk_001",
    payment_admin_id: "admin_001",
    name: "María López",
    created_at: new Date("2026-04-15T09:00:00Z"),
  },
  {
    clerk_user_id: "clerk_002",
    payment_admin_id: "admin_002",
    name: "Juan Pérez",
    created_at: new Date("2026-04-20T14:30:00Z"),
  },
];
