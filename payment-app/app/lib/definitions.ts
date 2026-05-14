export type Payment = {
  payment_id: string;

  order_id: string;
  buyer_id: string;
  seller_id: string;

  amount: number;

  //estado interno del sistema
  payment_status: "pending" | "cancelled" | "approved" | "rejected" | "expired";

  created_at: Date;
  updated_at: Date;

  //datos externos de MercadoPago

  mp_payment_id?: string;
  mp_status?: string;
  mp_payment_method?: string;
  mp_payment_date?: Date;
};
export type Payment_Admin = {
  clerk_user_id: string;
  payment_admin_id: string;
  name: string;
  created_at: Date; //es util para poder responder¿Quién agregó este admin?¿Cuándo obtuvo permisos?¿Desde cuándo tiene acceso?
};
export type LatestPayment = {
  id: string;
  name: string;
  amount: string;
};
