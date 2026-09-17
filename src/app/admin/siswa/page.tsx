"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Student {
  id: string
  nis: string
  name: string
  balance: number
  uid: string
  isActive: boolean
  isBlocked: boolean
}

export default function AdminSiswaPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [newStudent, setNewStudent] = useState({ nis: "", name: "", uid: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [search])

  const fetchStudents = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ search, limit: "100" })
      const res = await fetch(`/api/admin/siswa?${params}`)
      const data = await res.json()
      if (data.students) {
        setStudents(data.students)
      }
    } catch (err) {
      setError("Gagal memuat data siswa")
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async () => {
    if (!newStudent.nis || !newStudent.name || !newStudent.uid) {
      setError("Semua field wajib diisi")
      return
    }

    try {
      const res = await fetch("/api/admin/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal menambah siswa")
      }

      setSuccess("Siswa berhasil ditambahkan")
      setNewStudent({ nis: "", name: "", uid: "" })
      setShowAdd(false)
      fetchStudents()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleBlock = async (id: string, isBlocked: boolean) => {
    const action = isBlocked ? "unblock" : "block"
    if (!window.confirm(`Yakin ${action} kartu ini?`)) return

    try {
      const res = await fetch(`/api/admin/siswa/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })

      if (!res.ok) throw new Error("Gagal update status")

      fetchStudents()
    } catch (err) {
      setError("Gagal mengubah status kartu")
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Siswa</h1>
        <Button onClick={() => setShowAdd(!showAdd)} variant="primary">
          {showAdd ? "Batal" : "+ Tambah Siswa"}
        </Button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

      {/* Add Form */}
      {showAdd && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Tambah Siswa Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">NIS</label>
                <Input
                  value={newStudent.nis}
                  onChange={(e) => setNewStudent({...newStudent, nis: e.target.value})}
                  placeholder="10001"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Nama</label>
                <Input
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">UID RFID</label>
                <Input
                  value={newStudent.uid}
                  onChange={(e) => setNewStudent({...newStudent, uid: e.target.value.toUpperCase()})}
                  placeholder="A1B2C3D4"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddStudent} variant="primary" className="w-full">
                  Simpan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari NIS, nama, atau UID..."
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="overflow-x-auto">
          {loading && <p className="text-center py-8">Memuat...</p>}
          {!loading && students.length === 0 && (
            <p className="text-center py-8 text-gray-500">Tidak ada data siswa</p>
          )}
          {!loading && students.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UID</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{s.nis}</td>
                    <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{s.uid}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                      Rp {s.balance.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.isBlocked ? (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Diblokir</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Aktif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        onClick={() => handleBlock(s.id, s.isBlocked)}
                        variant="secondary"
                        className="text-xs px-2 py-1"
                      >
                        {s.isBlocked ? "Aktifkan" : "Blokir"}
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