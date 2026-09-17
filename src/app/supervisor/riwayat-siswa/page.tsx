"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface MutationLog {
  id: string
  student: { name: string; nis: string }
  type: "TOPUP" | "DEBIT" | "REFUND"
  amount: number
  balanceBefore: number
  balanceAfter: number
  createdAt: string
  createdBy?: { name: string }
  referenceType: "TRANSACTION" | "TOPUP"
}

interface Student {
  id: string
  nis: string
  name: string
}

export default function RiwayatSiswaPage() {
  const [mutations, setMutations] = useState<MutationLog[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    fetchMutations()
  }, [selectedStudent, startDate, endDate])

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/siswa?limit=100")
      const data = await res.json()
      if (data.students) {
        setStudents(data.students)
      }
    } catch (err) {
      console.error("Error fetching students:", err)
    }
  }

  const fetchMutations = async () => {
    if (!selectedStudent) {
      setMutations([])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ studentId: selectedStudent })
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const res = await fetch(`/api/admin/siswa/riwayat?${params.toString()}`)
      const data = await res.json()

      if (data.mutations) {
        setMutations(data.mutations)
      }
    } catch (err) {
      console.error("Error fetching mutations:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMutations = mutations.filter(m => 
    m.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.student?.nis.includes(searchTerm)
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Riwayat Siswa</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pilih Siswa</label>
              <select 
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Pilih Siswa...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nis} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Mulai</label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tanggal Akhir</label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cari</label>
              <div className="relative">
                <Input 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Cari siswa..." 
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo Setelah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!selectedStudent && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Pilih siswa untuk melihat riwayat transaksi
                    </td>
                  </tr>
                )}
                {selectedStudent && loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Memuat...
                    </td>
                  </tr>
                )}
                {selectedStudent && !loading && filteredMutations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data mutasi
                    </td>
                  </tr>
                )}
                {selectedStudent && !loading && filteredMutations.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(m.createdAt).toLocaleString("id-ID", {
                        dateStyle: "short",
                        timeStyle: "short"
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{m.student?.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        m.type === "TOPUP" ? "bg-green-100 text-green-800" :
                        m.type === "DEBIT" ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm text-right ${
                      m.type === "TOPUP" ? "text-green-600" : "text-red-600"
                    }`}>
                      {m.type === "TOPUP" ? "+" : ""}
                      Rp {Math.abs(m.amount).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      Rp {m.balanceAfter.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {m.referenceType} {m.createdBy?.name && `• by ${m.createdBy.name}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}