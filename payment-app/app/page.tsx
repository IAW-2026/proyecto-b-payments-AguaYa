import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/select-role");

  return (
    <main
      className="relative min-h-screen"
      style={{ backgroundImage: "url('/rain.gif')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-[#0B1E2D]/80" />

      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-[#1B4965]/50">
          <Image
            src="/aguaya_payments_logo_bubbles_v2.svg"
            alt="AguaYa Pagos"
            width={160}
            height={48}
            className="h-32 w-auto"
          />
          <Link
            href="/sign-in"
            className="border border-[#3DD6F0] px-5 py-2 text-sm font-semibold text-[#3DD6F0] hover:bg-[#3DD6F0] hover:text-[#0B1E2D] transition-colors"
          >
            Iniciar sesión
          </Link>
        </header>

        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 border border-[#3DD6F0]/30 bg-[#3DD6F0]/10 px-4 py-1.5 text-sm text-[#3DD6F0] font-medium mb-6">
            <BoltIcon className="w-4 h-4" />
            Pagos seguros entre compradores y vendedores
          </div>
          <h1 className="text-5xl font-bold text-[#E8EEF1] max-w-2xl leading-tight mb-5">
            El portal de pagos de{" "}
            <span className="text-[#3DD6F0]">AguaYa</span>
          </h1>
          <p className="text-lg text-[#7FB3CC] max-w-xl mb-10">
            Gestioná tus pagos, consultá tus facturas y controlá el estado de
            cada operación, todo desde un solo lugar.
          </p>
        </section>

        {/* Feature cards */}
        <section className="flex flex-col sm:flex-row gap-6 justify-center px-8 pb-20 max-w-3xl mx-auto">
          <div className="flex-1 border border-[#1B4965] bg-[#0B1E2D]/60 backdrop-blur-sm p-8">
            <ShoppingBagIcon className="w-10 h-10 text-[#3DD6F0] mb-4" />
            <h2 className="text-lg font-semibold text-[#E8EEF1] mb-2">
              Para compradores
            </h2>
            <p className="text-sm text-[#7FB3CC] leading-relaxed">
              Seguí el estado de tus pagos en tiempo real, descargá tus
              facturas y revisá el historial completo de tus compras.
            </p>
          </div>

          <div className="flex-1 border border-[#1B4965] bg-[#0B1E2D]/60 backdrop-blur-sm p-8">
            <BuildingStorefrontIcon className="w-10 h-10 text-[#3DD6F0] mb-4" />
            <h2 className="text-lg font-semibold text-[#E8EEF1] mb-2">
              Para vendedores
            </h2>
            <p className="text-sm text-[#7FB3CC] leading-relaxed">
              Controlá los cobros recibidos, gestioná tus clientes y accedé
              a reportes detallados de cada transacción.
            </p>
          </div>

          <div className="flex-1 border border-[#1B4965] bg-[#0B1E2D]/60 backdrop-blur-sm p-8">
            <ShieldCheckIcon className="w-10 h-10 text-[#3DD6F0] mb-4" />
            <h2 className="text-lg font-semibold text-[#E8EEF1] mb-2">
              Seguro y confiable
            </h2>
            <p className="text-sm text-[#7FB3CC] leading-relaxed">
              Procesamos los pagos a través de MercadoPago con verificación
              de identidad en cada acceso.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
