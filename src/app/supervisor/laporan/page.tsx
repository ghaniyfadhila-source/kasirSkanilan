import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupervisorLaporanPage() {
  const [dailyRevenue, setDailyRevenue] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/supervisor/laporan").then(res => res.json()).then(data => {
      setDailyRevenue(data.dailyRevenue || 0)
      setMonthlyRevenue(data.monthlyRevenue || 0)
      setTotalTransactions(data.totalTransactions || 0)
      setTopProducts(data.topProducts || [])
      setLoading(false)
    }).catch(err => {
      console.error("Error fetching laporan:", err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Laporan Penjualan</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="text-center animate-spin">
              <p className="text-3xl font-bold">Memuat...</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center animate-spin">
              <p className="text-3xl font-bold">Memuat...</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center animate-spin">
              <p className="text-3xl font-bold">Memuat...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Laporan Penjualan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">Rp {dailyRevenue.toLocaleString("id-ID")}</p>
            <p className="text-sm text-gray-500">Omzet Hari Ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">Rp {monthlyRevenue.toLocaleString("id-ID")}</p>
            <p className="text-sm text-gray-500">Omzet Bulan Ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{totalTransactions}</p>
            <p className="text-sm text-gray-500">Total Transaksi</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={idx} className="border-b pb-2">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sold} terjual</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Penjualan</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[200px] bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart akan muncul di sini</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button href="/supervisor/riwayat-siswa" variant="outline">
          Lihat Riwayat Siswa
        </Button>
        <Button href="/admin/topup" variant="secondary" ml-2>
          Kelola Top-up
        </Button>
      </div>
    </div>
  )
}