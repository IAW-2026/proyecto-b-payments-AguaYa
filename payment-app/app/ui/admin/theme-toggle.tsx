"use client";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-[48px] w-full items-center gap-2 rounded-md p-3 text-sm font-medium text-[#1B4965] dark:text-[#7FB3CC] hover:bg-[#1B4965]/10 dark:hover:bg-[#1B4965]/20 hover:text-[#0B1E2D] dark:hover:text-[#E8EEF1] transition-colors"
    >
      <SunIcon className="h-5 w-5 dark:hidden" />
      <MoonIcon className="h-5 w-5 hidden dark:block" />
      <span className="dark:hidden">Modo oscuro</span>
      <span className="hidden dark:block">Modo claro</span>
    </button>
  );
}
