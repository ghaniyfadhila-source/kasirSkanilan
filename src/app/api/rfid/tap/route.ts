import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateStudentUID } from "@/lib/student-validator"

// API Key for ESP32 authentication
const RFID_API_KEY = process.env.RFID_API_KEY || "rfid-reader-secret-key-2024"

export async function GET(request: Request) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function POST(request: Request) {
  try {
    // Validate API key from header
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey || apiKey !== RFID_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized - API key invalid" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { uid } = body

    if (!uid) {
      return NextResponse.json(
        { error: "UID is required" },
        { status: 400 }
      )
    }

    // Find student by UID
    const student = await prisma.student.findUnique({
      where: { uid: uid.toUpperCase() }
    })

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    // Check if student is active and not blocked
    if (!student.isActive || student.isBlocked) {
      return NextResponse.json(
        { error: "Student account inactive or blocked" },
        { status: 403 }
      )
    }

    // Return student data (without sensitive info)
    return NextResponse.json({
      student: {
        id: student.id,
        nis: student.nis,
        name: student.name,
        photoUrl: student.photoUrl,
        balance: student.balance,
        isActive: student.isActive,
        isBlocked: student.isBlocked
      }
    })
  } catch (error) {
    console.error("RFID tap error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}