"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  outlet: { name: string }
  category: { name: string }
  imageUrl?: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [outletFilter, setOutletFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [search, outletFilter, categoryFilter])

  const fetchProducts = async () => {
    setLoading(true)
    setError("")

    try {
      let url = `/api/admin/produk?`
      const params = new URLSearchParams()

      if (search) params.append("search", search)
      if (outletFilter) params.append("outlet", outletFilter)
      if (categoryFilter) params.append("category", categoryFilter)
      params.append("limit", "100") // Get more products

      const res = await fetch(url + params.toString())
      const data = await res.json()

      if (data.products) {
        setProducts(data.products)
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Gagal memuat produk")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return
    
    try {
      const res = await fetch(`/api/admin/produk?id=${id}`, {
        method: "DELETE"
      })
      
      if (!res.ok) {
        throw new Error("Gagal menghapus produk")
      }
      
      fetchProducts()
    } catch (err) {
      setError("Gagal menghapus produk")
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <Button href="/admin/produk/create" variant="primary">
          Tambah Produk
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cari Produk</label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nama produk..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Outlet</label>
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Semua Outlet</option>
                <option value="SMART_CAFE">Smart Cafe</option>
                <option value="BUSINESS_CENTER">Business Center</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Semua Kategori</option>
                <option value="MAKANAN">Makanan</option>
                <option value="MINUMAN">Minuman</option>
                <option value="ATK">ATK</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading && (
            <div className="text-center py-8">
              <p className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></p>
              <p className="mt-2">Memuat...</p>
            </div>
          )}
          {!loading && products.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Tidak ada produk yang ditemukan
            </p>
          )}
          {!loading && products.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outlet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rp {product.price.toLocaleString("id-ID")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.outlet.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}