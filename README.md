# AguaYa — Payments App

## Deploy

**Producción:** [https://proyecto-b-payments-agua-ya.vercel.app/](https://proyecto-b-payments-agua-ya.vercel.app/)

## Usuarios de prueba

Al iniciar sesión, cualquier usuario se vincula automáticamente con IDs de prueba (buyer y seller) cargados en la base de datos.

**Usuario admin de corrección:**

- Email: `admin_payments+clerk_test@iaw.com`
- Contraseña: `iawuser#`

**Usuario no-admin con external_profile:**

- Email: `buyer+seller+clerktest@iaw.com` que tiene ambos roles
- Contraseña: `iawuser#`

**Para login:**

- Usar cualquier email o conectarse con Google/GitHub
- Al entrar, se asignan automáticamente roles de buyer y seller

**Para acceso admin:**

- Se requiere que el usuario tenga el rol `admin_payment` en Clerk (configurado manualmente)

## Notas de entrega

- El código final debe estar en el branch `main`.
- El deploy debe ser de producción en Vercel, no un preview.
- La aplicación contiene datos precargados suficientes para probar flujos de pago, facturas y administración.

## Instrucciones para evaluar

1. **Ir al deploy** y crear una cuenta.
2. **Seleccionar rol** en la pantalla inicial (Buyer, Seller o admin si tiene los permisos) .
3. **Explorar funcionalidades:**
   - **Buyer:** Ver pagos realizados, facturas y descargarlas en PDF
   - **Seller:** Ver cobros recibidos y facturas emitidas
   - **Admin:** Gestionar usuarios, pagos e invoices (si está disponible el acceso)
4. **Cambiar de rol:** Ir a Configuración para cambiar entre roles
5. **Para pagos de prueba:** En Mercado Pago, loguearse con:
   - **Usuario:** `TESTUSER5453253121500317797`
   - **Contraseña:** `ZvD9nNfBq6`
   - **Método de pago:** Seleccionar **Efectivo** para completar el pago en sandbox

## Descripción del proyecto

Esta es una aplicación de gestión de pagos diseñada para el ecosistema AguaYa. Funciona como intermediaria entre compradores, vendedores y Mercado Pago, permitiendo que los compradores realicen pagos y que los vendedores supervisen transacciones.

La app proporciona tres vistas principales: un dashboard de comprador (para ver pagos e invoices), un dashboard de vendedor (para ver ingresos) y un panel administrativo (para supervisar el sistema completo).

Cuando un pago se aprueba en Mercado Pago, la app genera automáticamente una factura en PDF, notifica a las apps de buyer y seller, y actualiza los estados en el sistema. Soporta búsqueda y paginación de pagos e invoices.

Los datos de prueba (pagos, facturas, usuarios) están precargados en la base de datos, permitiendo evaluar la app inmediatamente sin necesidad de crear pagos reales.

## Notas y decisiones de diseño

- **Autenticación con Clerk:** Se usa para manejar login, roles y metadatos de usuario de forma centralizada.
- **Paginación con `skip/offset`:** Se implementó para mantener simplicidad; con datos grandes convendría indexar en DB.
- **Búsqueda por texto:** Usa `contains` insensible a mayúsculas; mejorables con índices `GIN` en PostgreSQL.
- **Webhook de Mercado Pago:** Soporta múltiples formatos de notificación (query params, body JSON, merchant_order).
- **Notificación a apps externas:** Cuando un pago se aprueba, esta app notifica a las apps de buyer y seller via HTTP.
- **Facturas en PDF:** Se generan automáticamente al aprobarse un pago usando la librería `pdf-lib`.
- **Panel admin restringido:** Solo usuarios con rol `admin_payment` pueden acceder; falta UI para auto-asignar roles.

## Documentación adicional

Para información más detallada sobre APIs, webhooks y flujo de pagos, ver [TECHNICAL.md](./TECHNICAL.md).

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>
