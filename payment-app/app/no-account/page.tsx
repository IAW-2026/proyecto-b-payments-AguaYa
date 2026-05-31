import { SignOutButton } from "@clerk/nextjs";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function NoAccountPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-6">
        <ExclamationCircleIcon className="mx-auto h-14 w-14 text-yellow-400 mb-4" />

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tu cuenta no está vinculada
        </h1>

        <p className="text-gray-500 mb-2">
          Iniciaste sesión correctamente, pero tu usuario no está registrado en
          ninguna de las aplicaciones de AguaYa.
        </p>

        <p className="text-sm text-gray-400 mb-8">
          Para acceder, primero creá una cuenta en{" "}
          <span className="font-medium text-gray-600">AguaYa Buyer</span> o en{" "}
          <span className="font-medium text-gray-600">AguaYa Seller</span>.
          Una vez que lo hagas, volvé a iniciar sesión aquí.
        </p>

        <SignOutButton redirectUrl="/sign-in">
          <button className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors">
            Cerrar sesión
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
