"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Student {
  id: string
  nis: string
  name: string
  balance: number
  photoUrl?: string
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  outlet: { name: string }
  category: { name: string }
}

interface CartItem {
  product: Product
  quantity: number
}

export default function KasirPage() {
  const [uid, setUid] = useState("")
  const [student, setStudent] = useState<Student | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeOutlet, setActiveOutlet] = useState("SMART_CAFE")
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)

  // Fetch products
  useEffect(() => {
    fetchProducts()
  }, [activeOutlet])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/admin/produk?outlet=${activeOutlet}`)
      const data = await res.json()
      if (data.products) {
        setProducts(data.products)
      }
    } catch (err) {
      console.error("Error fetching products:", err)
    }
  }

  // Scan card (RFID tap)
  const handleScan = async () => {
    if (!uid.trim()) {
      setError("Masukkan UID kartu")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/rfid/tap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "rfid-reader-secret-key-2024"
        },
        body: JSON.stringify({ uid: uid.trim().toUpperCase() })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Gagal memindai kartu")
        setStudent(null)
      } else {
        setStudent(data.student)
        setCart([])
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi")
    } finally {
      setLoading(false)
    }
  }

  // Add to cart
  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id)

    if (existing) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  // Update quantity
  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((item) => item.product.id !== productId))
    } else {
      setCart(
        cart.map((item) =>
          item.product.id === productId ? { ...item, quantity: qty } : item
        )
      )
    }
  }

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  // Calculate total
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  // Checkout
  const handleCheckout = async () => {
    if (!student || cart.length === 0) return

    if (total > student.balance) {
      setError("Saldo tidak cukup!")
      return
    }

    setCheckoutLoading(true)
    setError("")

    try {
      const res = await fetch("/api/kasir/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity
          }))
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Checkout gagal")
      } else {
        setLastTransaction({
          ...data,
          student: { ...student, balance: data.student.newBalance }
        })
        setStudent({ ...student, balance: data.student.newBalance })
        setCart([])
        setShowReceipt(true)
        setSuccess("Transaksi berhasil!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err) {
      setError("Terjadi kesalahan saat checkout")
    } finally {
      setCheckoutLoading(false)
    }
  }

  // Reset for new transaction
  const newTransaction = () => {
    setStudent(null)
    setCart([])
    setUid("")
    setShowReceipt(false)
    setLastTransaction(null)
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Kasir - Pembayaran RFID</h1>

        {/* Scan Card Section */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tap RFID / masukkan UID kartu..."
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                className="text-lg"
                disabled={loading}
              />
              <Button onClick={handleScan} disabled={loading}>
                {loading ? "Memindai..." : "Pindai"}
              </Button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">{success}</p>}
          </CardContent>
        </Card>

        {/* Student Info */}
        {student && (
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Siswa:</p>
                  <p className="text-xl font-bold">{student.name}</p>
                  <p className="text-sm text-gray-600">NIS: {student.nis}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Saldo:</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {student.balance.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            {/* Outlet Tabs */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeOutlet === "SMART_CAFE" ? "primary" : "secondary"}
                onClick={() => setActiveOutlet("SMART_CAFE")}
              >
                Smart Cafe
              </Button>
              <Button
                variant={activeOutlet === "BUSINESS_CENTER" ? "primary" : "secondary"}
                onClick={() => setActiveOutlet("BUSINESS_CENTER")}
              >
                Business Center
              </Button>
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    product.stock === 0 ? "opacity-50" : ""
                  }`}
                  onClick={() => product.stock > 0 && addToCart(product)}
                >
                  <CardContent className="p-3">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-green-600 font-bold">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stok: {product.stock}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Tidak ada produk di outlet ini
              </p>
            )}
          </div>

          {/* Cart */}
          <div>
            <Card className="sticky top-4">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Keranjang</h2>
              </div>
              <CardContent className="p-4">
                {!student ? (
                  <p className="text-center text-gray-500 py-4">
                    Pindai kartu siswa terlebih dahulu
                  </p>
                ) : cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Keranjang kosong
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center border-b pb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            Rp {item.product.price.toLocaleString("id-ID")} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 bg-gray-200 rounded text-sm"
                          >
                            -
                          </button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 bg-gray-200 rounded text-sm"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="w-7 h-7 bg-red-100 text-red-600 rounded text-sm"
                          >
                            x
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                {cart.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg">
                        Rp {total.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-sm text-gray-500">Saldo Siswa:</span>
                      <span className={`text-sm ${student && total > student.balance ? "text-red-500" : "text-green-500"}`}>
                        Rp {(student?.balance || 0).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {student && total > student.balance && (
                      <p className="text-red-500 text-sm mb-2">
                        Saldo tidak cukup!
                      </p>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleCheckout}
                      disabled={checkoutLoading || !student || cart.length === 0 || (student && total > student.balance)}
                    >
                      {checkoutLoading ? "Memproses..." : "Bayar Sekarang"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceipt && lastTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full bg-white">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <p className="text-green-500 text-4xl mb-2">&#10003;</p>
                  <h2 className="text-xl font-bold">Transaksi Berhasil!</h2>
                </div>

                <div className="border-t border-b py-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span>Siswa:</span>
                    <span className="font-medium">{lastTransaction.student.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Total:</span>
                    <span className="font-bold">Rp {lastTransaction.totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sisa Saldo:</span>
                    <span className="font-medium text-green-600">
                      Rp {lastTransaction.student.balance.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {lastTransaction.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.priceAtTime.toLocaleString("id-ID")}</span>
                      <span>Rp {item.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>

                <p className="text-center text-sm text-gray-500 mb-4">
                  {new Date().toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "short"
                  })}
                </p>

                <Button className="w-full" onClick={newTransaction}>
                  Transaksi Baru
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}