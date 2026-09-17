import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Sistem Kasir Cashless</h1>
        <p className="text-gray-600 mb-8">
          Sistem Point of Sale dengan pembayaran RFID untuk sekolah
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            Login
          </Link>
          <Link
            href="/kasir"
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-md transition-colors"
          >
            Buka Kasir (Direct)
          </Link>
        </div>
      </div>
    </div>
  )
}