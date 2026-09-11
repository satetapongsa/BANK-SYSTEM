import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/app/components/NavBar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "APEX DIGITAL BANK — Next-Gen Digital Banking Platform",
  description: "APEX DIGITAL BANK — ระบบบริหารจัดการการเงินและธนาคารดิจิทัลระดับองค์กร ปลอดภัยด้วย ACID Database Transaction, RBAC และ Immutable Audit Logging",
  keywords: "apex bank, digital banking, financial platform, secure banking, acid transactions",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {/* Navigation Bar */}
        <NavBar />
        
        {/* Main content area */}
        <main className="min-h-screen pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}