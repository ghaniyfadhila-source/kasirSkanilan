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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nis: { contains: search } },
        { uid: { contains: search, mode: "insensitive" } }
      ]
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          nis: true,
          name: true,
          balance: true,
          uid: true,
          isActive: true,
          isBlocked: true,
          createdAt: true
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.student.count({ where })
    ])

    return NextResponse.json({
      students,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { nis, name, uid, initialBalance } = await request.json()

    if (!nis || !name || !uid) {
      return NextResponse.json(
        { error: "NIS, Nama, dan UID wajib diisi" },
        { status: 400 }
      )
    }

    // Check if NIS or UID already exists
    const existing = await prisma.student.findFirst({
      where: { OR: [{ nis }, { uid }] }
    })

    if (existing) {
      if (existing.nis === nis) {
        return NextResponse.json({ error: "NIS sudah terdaftar" }, { status: 400 })
      }
      if (existing.uid === uid) {
        return NextResponse.json({ error: "UID kartu sudah terdaftar" }, { status: 400 })
      }
    }

    const student = await prisma.student.create({
      data: {
        nis,
        name,
        uid: uid.toUpperCase(),
        balance: initialBalance || 0,
        isActive: true,
        isBlocked: false
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}