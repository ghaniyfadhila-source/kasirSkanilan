import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const MIN_TOPUP = 5000
const MAX_BALANCE = 500000

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const { studentId, amount } = await request.json()

    if (!studentId || !amount || isNaN(amount)) {
      return Response.json(
        { error: "Student ID and amount are required" },
        { status: 400 }
      )
    }

    if (amount < MIN_TOPUP) {
      return Response.json(
        { error: `Minimum top-up is ${MIN_TOPUP}` },
        { status: 400 }
      )
    }

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if adding amount would exceed max balance
    const newBalance = student.balance + amount
    if (newBalance > MAX_BALANCE) {
      return Response.json(
        { error: `Maximum balance per student is ${MAX_BALANCE}` },
        { status: 400 }
      )
    }

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create top-up record
      const topup = await tx.topup.create({
        data: {
          studentId,
          adminId: session.user.id,
          amount,
          method: "CASH"
        }
      })

      // Update balance
      await tx.student.update({
        where: { id: studentId },
        data: { balance: newBalance }
      })

      // Log mutation
      await tx.mutationLog.create({
        data: {
          studentId,
          type: "TOPUP",
          amount,
          balanceBefore: student.balance,
          balanceAfter: newBalance,
          referenceId: topup.id,
          referenceType: "TOPUP",
          createdBy: session.user.id
        }
      })

      return { topup, newBalance }
    })

    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error("Topup error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}