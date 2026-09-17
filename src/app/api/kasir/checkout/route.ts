import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { studentId, items } = await request.json()

    if (!studentId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Student ID and items are required" },
        { status: 400 }
      )
    }

    // Get student with current balance
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        balance: true,
        isBlocked: true,
        isActive: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (student.isBlocked || !student.isActive) {
      return NextResponse.json(
        { error: "Student account is blocked or inactive" },
        { status: 403 }
      )
    }

    // Get product details for all items
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, stock: { gt: 0 } }
    })

    // Validate stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or out of stock` },
          { status: 400 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Calculate total
    let totalAmount = 0
    const itemsWithPrices = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId)
      const subtotal = product.price * item.quantity
      totalAmount += subtotal
      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: product.price,
        subtotal
      }
    })

    // Validate balance
    if (student.balance < totalAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ${student.balance}, Required: ${totalAmount}` },
        { status: 400 }
      )
    }

    // Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          studentId: student.id,
          cashierId: "SYSTEM", // Will be updated from session
          totalAmount,
          status: "SUCCESS",
          paymentMethod: "RFID"
        }
      })

      // Create transaction items
      await tx.transactionItem.createMany({
        data: itemsWithPrices.map((item) => ({
          transactionId: transaction.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime,
          subtotal: item.subtotal
        }))
      })

      // Update student balance
      const newBalance = student.balance - totalAmount
      await tx.student.update({
        where: { id: student.id },
        data: { balance: newBalance }
      })

      // Log mutation
      await tx.mutationLog.create({
        data: {
          studentId: student.id,
          type: "DEBIT",
          amount: -totalAmount,
          balanceBefore: student.balance,
          balanceAfter: newBalance,
          referenceId: transaction.id,
          referenceType: "TRANSACTION"
        }
      })

      // Reduce stock
      for (const item of itemsWithPrices) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }

      return { transaction, newBalance }
    })

    return NextResponse.json({
      transaction: result.transaction,
      student: {
        name: student.name,
        newBalance: result.newBalance
      },
      items: itemsWithPrices,
      totalAmount
    }, { status: 201 })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    )
  }
}