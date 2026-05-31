import "@/app/ui/global.css";
import { ClerkProvider } from "@clerk/nextjs";
import { inter } from "@/app/ui/fonts";
import ThemeProvider from "@/app/ui/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
