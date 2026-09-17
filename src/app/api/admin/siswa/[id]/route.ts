import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !["ADMIN", "SUPERVISOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const student = await prisma.student.findUnique({
      where: { id: request.url.split("/").pop() },
      include: {
        mutations: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { cashier: { select: { name: true } } }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const id = request.url.split("/").pop()
    const { action, newUid } = await request.json()

    const student = await prisma.student.findUnique({ where: { id } })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    let updated

    if (action === "block") {
      updated = await prisma.student.update({
        where: { id },
        data: { isBlocked: true }
      })
    } else if (action === "unblock") {
      updated = await prisma.student.update({
        where: { id },
        data: { isBlocked: false }
      })
    } else if (action === "replaceUid" && newUid) {
      // Check if new UID is already used
      const existing = await prisma.student.findUnique({ where: { uid: newUid.toUpperCase() } })
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "UID sudah digunakan siswa lain" }, { status: 400 })
      }

      updated = await prisma.student.update({
        where: { id },
        data: { uid: newUid.toUpperCase(), isBlocked: false }
      })
    } else if (action === "topup") {
      // This would be handled by topup route
      return NextResponse.json({ error: "Use /api/admin/topup for topup" }, { status: 400 })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}