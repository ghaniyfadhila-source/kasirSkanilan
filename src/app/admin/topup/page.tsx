"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Student {
  id: string
  nis: string
  name: string
  balance: number
}

export default function AdminTopupPage() {
  const [uid, setUid] = useState("")
  const [student, setStudent] = useState<Student | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [topupLoading, setTopupLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleScan = async () => {
    if (!uid.trim()) {
      setError("Masukkan UID kartu")
      return
    }

    setLoading(true)
    setError("")
    setStudent(null)

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
        setError(data.error || "Kartu tidak ditemukan")
      } else {
        setStudent(data.student)
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi")
    } finally {
      setLoading(false)
    }
  }

  const handleTopup = async () => {
    if (!student || !amount) return

    const nominal = parseInt(amount)
    if (isNaN(nominal) || nominal < 5000) {
      setError("Minimum top-up adalah Rp 5.000")
      return
    }
    if (nominal + student.balance > 500000) {
      setError("Melebihi batas saldo maksimal Rp 500.000")
      return
    }

    setTopupLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/admin/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, amount: nominal })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Top-up gagal")
      }

      setSuccess(`Top-up berhasil! Saldo baru: Rp ${(student.balance + nominal).toLocaleString("id-ID")}`)
      setStudent({ ...student, balance: student.balance + nominal })
      setAmount("")
      setUid("")
      setTimeout(() => setSuccess(""), 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setTopupLoading(false)
    }
  }

  const quickAmounts = [5000, 10000, 20000, 50000, 100000]

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Top-up Saldo</h1>

      {/* Scan Card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Pindai Kartu Siswa</h3>
          <div className="flex gap-2">
            <Input
              value={uid}
              onChange={(e) => setUid(e.target.value.toUpperCase())}
              placeholder="Masukkan UID kartu..."
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
            <Button onClick={handleScan} disabled={loading}>
              {loading ? "Memindai..." : "Pindai"}
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          {success && <p className="text-green-500 mt-2 text-sm">{success}</p>}
        </CardContent>
      </Card>

      {/* Student Info */}
      {student && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Siswa:</p>
                <p className="text-xl font-bold">{student.name}</p>
                <p className="text-sm text-gray-600">NIS: {student.nis}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Saldo Saat Ini:</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {student.balance.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topup Form */}
      {student && (
        <Card>
          <CardHeader>
            <CardTitle>Masukkan Nominal Top-up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Nominal (Rp)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                min="5000"
                max="500000"
              />
            </div>

            {/* Quick Amounts */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {quickAmounts.map(q => (
                <button
                  key={q}
                  onClick={() => setAmount(q.toString())}
                  className={`px-3 py-2 border rounded text-sm font-medium transition-colors ${
                    amount === q.toString()
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {q >= 1000 ? `${q/1000}rb` : q}
                </button>
              ))}
            </div>

            {/* Info */}
            <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded">
              <p>Minimum top-up: <strong>Rp 5.000</strong></p>
              <p>Batas saldo maksimal: <strong>Rp 500.000</strong></p>
              <p>Saldo setelah top-up: <strong>Rp {(parseInt(amount) || 0 + student.balance).toLocaleString("id-ID")}</strong></p>
            </div>

            <Button
              onClick={handleTopup}
              disabled={topupLoading || !amount}
              variant="primary"
              className="w-full"
            >
              {topupLoading ? "Memproses..." : "Proses Top-up"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}