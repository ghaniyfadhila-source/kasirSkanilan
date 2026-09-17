import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check user role (only ADMIN and SUPERVISOR can access)
    if (!["ADMIN", "SUPERVISOR"].includes(session.user.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse search params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const outlet = searchParams.get("outlet") || ""
    const category = searchParams.get("category") || ""

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } }
      ]
    }

    if (outlet) {
      where.outlet = { name: { contains: outlet, mode: "insensitive" } }
    }

    if (category) {
      where.category = { name: { contains: category, mode: "insensitive" } }
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          outlet: true
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return Response.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, price, stock, categoryId, outletId, imageUrl } = body

    // Validate required fields
    if (!name || !price || !categoryId || !outletId) {
      return Response.json(
        { error: "Name, price, category and outlet are required" },
        { status: 400 }
      )
    }

    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        name,
        categoryId,
        outletId,
        isActive: true
      }
    })

    if (existingProduct) {
      return Response.json(
        { error: "Product already exists in this outlet and category" },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        price,
        stock: stock || 0,
        imageUrl,
        categoryId,
        outletId
      },
      include: { category: true, outlet: true }
    })

    return Response.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}