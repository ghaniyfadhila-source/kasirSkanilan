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

    // Today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // This month's date range
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    // Daily revenue
    const dailyRevenueAgg = await prisma.transaction.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "SUCCESS",
        createdAt: { gte: today, lt: tomorrow }
      }
    })

    // Monthly revenue
    const monthlyRevenueAgg = await prisma.transaction.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "SUCCESS",
        createdAt: { gte: thisMonthStart, lt: nextMonthStart }
      }
    })

    // Total transactions this month
    const totalTransactions = await prisma.transaction.count({
      where: {
        status: "SUCCESS",
        createdAt: { gte: thisMonthStart, lt: nextMonthStart }
      }
    })

    // Top products this month
    const topProducts = await prisma.transactionItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: {
        transaction: {
          status: "SUCCESS",
          createdAt: { gte: thisMonthStart, lt: nextMonthStart }
        }
      },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10
    })

    // Get product details for top products
    const productIds = topProducts.map(t => t.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    })

    const topProductsWithNames = topProducts.map(tp => {
      const product = products.find(p => p.id === tp.productId)
      return {
        name: product?.name || "Unknown",
        sold: tp._sum.quantity || 0
      }
    })

    return NextResponse.json({
      dailyRevenue: dailyRevenueAgg._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenueAgg._sum.totalAmount || 0,
      totalTransactions,
      topProducts: topProductsWithNames
    })
  } catch (error) {
    console.error("Error fetching laporan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}