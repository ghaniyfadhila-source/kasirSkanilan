import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sistem Kasir Cashless RFID",
  description: "Sistem Kasir Cashless Berbasis RFID untuk Sekolah",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}