"use client";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-[48px] w-full items-center gap-2 rounded-md p-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
    >
      <SunIcon className="h-5 w-5 dark:hidden" />
      <MoonIcon className="h-5 w-5 hidden dark:block" />
      <span className="dark:hidden">Modo oscuro</span>
      <span className="hidden dark:block">Modo claro</span>
    </button>
  );
}
