# Documentación Técnica — AguaYa Payments App

## Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL + Prisma ORM
- **Autenticación:** Clerk
- **Pagos:** Mercado Pago (SDK oficial)
- **Estilos:** Tailwind CSS
- **PDF:** pdf-lib

## Configuración local

### Requisitos previos

- Node.js 18+
- PostgreSQL
- npm o pnpm

### Instalación

```bash
git clone <repo>
cd payment-app
npm install
cp .env.example .env.local
# Completar variables en .env.local
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**Servidor disponible en:** `http://localhost:3000`

## Rutas principales

| Ruta                    | Descripción                                      |
| ----------------------- | ------------------------------------------------ |
| `/`                     | Landing page con redirección según autenticación |
| `/sign-in`              | Login con Clerk                                  |
| `/sign-up`              | Registro con Clerk                               |
| `/select-role`          | Seleccionar entre Buyer, Seller o Admin          |
| `/no-account`           | Pantalla para usuarios sin cuenta vinculada      |
| `/dashboard`            | Dashboard del buyer/seller según rol             |
| `/payments`             | Listado de pagos con filtros y búsqueda          |
| `/invoices`             | Listado de facturas con búsqueda                 |
| `/invoices/[invoiceId]` | Detalle de factura con opción descargar PDF      |
| `/settings`             | Configuración de perfil y cambio de rol          |
| `/admin/dashboard`      | Dashboard administrativo                         |
| `/admin/payments`       | Gestión de pagos (admin)                         |
| `/admin/invoices`       | Gestión de facturas (admin)                      |
| `/admin/users`          | Gestión de usuarios (admin)                      |

## APIs

### 1. POST `/api/payments`

Crea un nuevo pago desde la Buyer App.

**Headers:**

```
x-api-key: <INTERNAL_API_KEY>
Content-Type: application/json
```

**Body:**

```json
{
  "orderId": "ORD-12345",
  "buyer": {
    "id": "buyer-001",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "seller": {
    "id": "seller-001",
    "name": "Tienda ABC"
  },
  "amount": 50000,
  "items": [
    {
      "id": "prod-001",
      "name": "Producto A",
      "imageUrl": "https://example.com/prod.jpg",
      "quantity": 2,
      "unitPrice": 25000
    }
  ]
}
```

**Validación:**

- El `amount` debe ser igual a la suma de `quantity × unitPrice` de todos los items
- Si no coinciden, devuelve `400 Bad Request`

**Respuesta exitosa (200):**

```json
{
  "id": "pag-xyz",
  "orderId": "ORD-12345",
  "status": "pending",
  "mpPreferenceId": "mp-pref-123",
  "checkoutUrl": "https://mercadopago.com/checkout/..."
}
```

---

### 2. GET `/api/invoices/[invoiceId]/pdf`

Descarga la factura en PDF.

**Parámetros de ruta:**

- `invoiceId` (string, requerido): ID de la factura

**Respuesta:**

- `200`: Archivo PDF binario con Content-Type `application/pdf`
- `401`: Si no estás autenticado
- `404`: Si la factura no existe o no tienes acceso

**Headers de respuesta:**

```
Content-Disposition: attachment; filename="invoice-{invoiceId}.pdf"
```

---

### 3. POST `/api/webhooks/mercadopago`

Webhook que recibe notificaciones de Mercado Pago sobre cambios de estado en pagos.

**Formatos soportados:**

#### Query String: Dashboard de MP

```
POST /api/webhooks/mercadopago?type=payment&data.id=12345678
```

#### Query String: IPN directo

```
POST /api/webhooks/mercadopago?topic=payment&id=12345678
```

#### Query String: Merchant Order

```
POST /api/webhooks/mercadopago?topic=merchant_order&id=87654321
```

(La app resuelve el pago desde los pagos asociados a la merchant order)

#### Body JSON

```json
POST /api/webhooks/mercadopago
Content-Type: application/json

{
  "type": "payment",
  "action": "payment.created",
  "data": {
    "id": 12345678
  }
}
```

**Flujo de procesamiento:**

1. Extrae el ID del pago de Mercado Pago
2. Consulta el estado actual en MP
3. Valida que existe un pago local con ese `external_reference`
4. Si el estado es "approved":
   - Actualiza el pago a "approved"
   - Genera la factura automáticamente
   - **Notifica a Seller App** via `PATCH /api/orders/{orderId}`
   - **Notifica a Buyer App** via `PATCH /api/orders/{orderId}`
5. Si el estado es "rejected" o "cancelled", actualiza en consecuencia
6. Retorna `{ success: true }` si procesa correctamente

---

## Notificación a apps externas

Cuando un pago se aprueba, esta app notifica a las apps de buyer y seller.

### Seller App

```http
PATCH /api/orders/{orderId}
X-Service-Token: {SELLER_APP_SERVICE_TOKEN}
Content-Type: application/json

{
  "transactionId": "mp-payment-id",
  "amount": 50000
}
```

### Buyer App

```http
PATCH /api/orders/{orderId}
X-Service-Token: {BUYER_APP_SERVICE_TOKEN}
Content-Type: application/json

{
  "transactionId": "mp-payment-id",
  "amount": 50000,
  "buyerId": "buyer-001"
}
```

Si alguna notificación falla, se registra en logs pero no bloquea el flujo.

---

## Flujo de pagos completo

```
┌─────────────────────────────────────────────────────────┐
│                      BUYER APP                          │
│  Usuario selecciona items para comprar                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ POST /api/payments
                     │ (validar, crear orden)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              PAYMENTS APP (esta)                        │
│  - Valida monto = suma de items                         │
│  - Crea record de pago en BD con status="pending"       │
│  - Obtiene preference de Mercado Pago                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Devuelve checkout URL
                     ▼
┌─────────────────────────────────────────────────────────┐
│              USUARIO EN NAVEGADOR                       │
│  Abre link de checkout en Mercado Pago                  │
│  Completa el pago con tarjeta/billetera                │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Mercado Pago procesa pago
                     │ Resultado: approved/rejected/etc
                     ▼
┌─────────────────────────────────────────────────────────┐
│           MERCADO PAGO (webhooks)                       │
│  Envía notificación al endpoint de webhooks             │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ POST /api/webhooks/mercadopago
                     ▼
┌─────────────────────────────────────────────────────────┐
│              PAYMENTS APP (webhook)                     │
│  - Valida y procesa notificación                        │
│  - Actualiza status en BD                              │
│  - Si approved: genera factura (PDF)                    │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ BD      │ │ Seller  │ │ Buyer   │
    │ Update  │ │ App     │ │ App     │
    │ status  │ │ notify  │ │ notify  │
    └─────────┘ └─────────┘ └─────────┘
```

---

## Búsqueda y paginación

### Pagos

- **Filtros:** Estado (pending/approved/rejected/cancelled/expired), rango de fechas, búsqueda de texto
- **Búsqueda de texto:** `orderId`, `buyerName`, `sellerName` (case-insensitive)
- **Paginación:** `skip/take`, 10 items por página
- **Ordenamiento:** Por `createdAt` descendente

### Facturas

- **Búsqueda de texto:** `orderId` (case-insensitive)
- **Paginación:** `skip/take`, 10 items por página
- **Ordenamiento:** Por `issuedAt` descendente

---

## Estadísticas y reportes (Admin)

### Dashboard

- Cuenta total de pagos por estado
- Ingresos aprobados
- Últimos pagos

### Reportes del vendedor (Admin)

- Ingresos mensuales (últimos 12 meses)
- Productos más vendidos
- Productos con mayor ingresos

---

## Modelo de datos (Prisma)

### Payment

```prisma
model Payment {
  id              String
  orderId         String
  buyerId         String
  buyerName       String
  buyerEmail      String
  sellerId        String
  sellerName      String
  amount          Int
  status          PaymentStatus
  createdAt       DateTime
  updatedAt       DateTime
  mpPreferenceId  String?
  mpPaymentId     String?
  mpStatus        String?
  mpPaymentMethod String?
  mpPaymentDate   DateTime?
  invoice         Invoice?
  items           PaymentItemSnapshot[]
}
```

### Invoice

```prisma
model Invoice {
  id        String
  paymentId String (unique)
  subtotal  Int
  tax       Int
  total     Int
  issuedAt  DateTime
  payment   Payment
}
```

### ExternalProfile

```prisma
model ExternalProfile {
  id            String
  profileNumber Int (unique, autoincrement)
  userName      String?
  clerkId       String (unique)
  buyerId       String?
  sellerId      String?
  status        ProfileStatus
  createdAt     DateTime
}
```

---

## Limitaciones conocidas y mejoras futuras

1. **Búsqueda de texto:** Actualmente usa `contains` simple; mejorable con índices `GIN` y `pg_trgm` en PostgreSQL para búsquedas más rápidas.
2. **Paginación:** Usa `skip/offset` que es simple pero ineficiente con datos muy grandes; considerar cursor-based pagination.
3. **Admin roles:** Solo usuarios pre-configurados en Clerk con rol `admin_payment` pueden acceder; no hay UI para auto-asignar roles.
4. **Notificaciones bloqueadas:** Si las apps de buyer/seller no responden, se registra error pero no se reintenta.
5. **PDF:** Las facturas se generan al momento; con volumen alto, considerar generar en background jobs.

---

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar en producción localmente
npm run start

# Lint
npm run lint

# Prisma
npx prisma studio              # Abrir UI de BD
npx prisma migrate dev         # Crear nueva migración
npx prisma db seed             # Cargar datos de prueba
npx prisma db push             # Sync schema sin migración
```
