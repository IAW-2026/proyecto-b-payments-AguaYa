import "@/app/ui/global.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { inter } from "@/app/ui/fonts";
import ThemeProvider from "@/app/ui/theme-provider";

export const metadata: Metadata = {
  title: {
    template: "%s | AguaYa Pagos",
    default: "AguaYa Pagos",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/select-role"
      signUpFallbackRedirectUrl="/select-role"
    >
      <html lang="es" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
