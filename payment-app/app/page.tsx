import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { lusitana } from "@/app/ui/fonts";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/select-role");

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className={`${lusitana.className} flex items-center gap-2 text-blue-600`}>
          <span className="text-2xl font-bold">AguaYa</span>
          <span className="text-sm font-normal text-gray-600 mt-1">Pagos</span>
        </div>
        <Link
          href="/sign-in"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700 font-medium mb-6">
          <BoltIcon className="w-4 h-4" />
          Pagos seguros entre compradores y vendedores
        </div>
        <h1
          className={`${lusitana.className} text-5xl font-bold text-gray-900 max-w-2xl leading-tight mb-5`}
        >
          El portal de pagos de{" "}
          <span className="text-blue-600">AguaYa</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-10">
          Gestioná tus pagos, consultá tus facturas y controlá el estado de
          cada operación, todo desde un solo lugar.
        </p>
      </section>

      {/* Feature cards */}
      <section className="flex flex-col sm:flex-row gap-6 justify-center px-8 pb-20 max-w-3xl mx-auto">
        <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <ShoppingBagIcon className="w-10 h-10 text-blue-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Para compradores
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Seguí el estado de tus pagos en tiempo real, descargá tus
            facturas y revisá el historial completo de tus compras.
          </p>
        </div>

        <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <BuildingStorefrontIcon className="w-10 h-10 text-blue-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Para vendedores
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Controlá los cobros recibidos, gestioná tus clientes y accedé
            a reportes detallados de cada transacción.
          </p>
        </div>

        <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <ShieldCheckIcon className="w-10 h-10 text-blue-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Seguro y confiable
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Procesamos los pagos a través de MercadoPago con verificación
            de identidad en cada acceso.
          </p>
        </div>
      </section>
    </main>
  );
}
