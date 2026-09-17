import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  // Fetch summary data
  const [totalStudents, totalTransactions, totalRevenue, totalProducts] = await Promise.all([
    prisma.student.count(),
    prisma.transaction.count({ where: { status: "SUCCESS" } }),
    prisma.transaction.aggregate({
      _sum: { totalAmount: true },
      where: { status: "SUCCESS" }
    }),
    prisma.product.count({ where: { isActive: true } })
  ])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTransactions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Omzet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Rp {totalRevenue._sum.totalAmount?.toLocaleString("id-ID") || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button href="/kasir" className="justify-start">
                🛒 Buka Kasir
              </Button>
              <Button href="/admin/topup" variant="secondary" className="justify-start">
                💰 Top-up Saldo
              </Button>
              <Button href="/admin/produk" variant="secondary" className="justify-start">
                📦 Kelola Produk
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Recent transaction data will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}