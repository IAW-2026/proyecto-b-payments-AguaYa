# AguaYa — Payments App

Aplicación de pagos para el ecosistema AguaYa. Gestiona los pagos iniciados desde la Buyer App, procesa las notificaciones de Mercado Pago vía webhook y genera facturas descargables en PDF.

## Deploy

[https://proyecto-b-payments-agua-ya.vercel.app/](https://proyecto-b-payments-agua-ya.vercel.app/)

## Stack

- **Framework:** Next.js (App Router)
- **Base de datos:** PostgreSQL (Neon) + Prisma ORM
- **Autenticación:** Clerk
- **Pagos:** Mercado Pago (sandbox)
- **Estilos:** Tailwind CSS

## Cómo probar la app

1. Ingresá al [link de deploy](https://proyecto-b-payments-agua-ya.vercel.app/)
2. Creá una cuenta con cualquier email o usá Google/GitHub
3. Al iniciar sesión, la app te asigna automáticamente IDs de prueba (buyer y seller)
4. Seleccioná el rol que querés explorar:
   - **Comprador:** ve tus pagos e invoices, descargá PDFs
   - **Vendedor:** ve los pagos recibidos y las facturas emitidas
5. Podés cambiar de rol en cualquier momento desde **Configuración**

> Los datos de prueba ya están precargados en la base de datos (pagos aprobados, pendientes, rechazados y sus facturas).

## Desarrollo local

```bash
npm install
cp .env.example .env.local
# Completar las variables en .env.local
npm run dev
```

Para cargar datos de prueba:

```bash
npx prisma db seed
```

## Variables de entorno

Ver [.env.example](.env.example) para la lista completa de variables requeridas.
