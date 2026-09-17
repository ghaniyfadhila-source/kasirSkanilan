"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Email dan password wajib diisi")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email,
          password,
          csrfToken: "test"
        })
      })

      if (res.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError("Email atau password salah")
      }
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (em: string, pw: string) => {
    setEmail(em)
    setPassword(pw)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1">Sistem Kasir Cashless</h1>
            <p className="text-sm text-gray-500">Login untuk melanjutkan</p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sekolah.id"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>

          {/* Quick Login (dev only) */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500 mb-2 text-center">Quick Login (Development)</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickLogin("admin@sekolah.id", "admin123")}
                className="px-2 py-1 border rounded hover:bg-gray-50"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin("kasir@sekolah.id", "kasir123")}
                className="px-2 py-1 border rounded hover:bg-gray-50"
              >
                Kasir
              </button>
              <button
                type="button"
                onClick={() => quickLogin("supervisor@sekolah.id", "supervisor123")}
                className="px-2 py-1 border rounded hover:bg-gray-50"
              >
                Supervisor
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}