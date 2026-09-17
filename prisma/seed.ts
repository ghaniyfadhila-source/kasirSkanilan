import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create Users (Kasir, Admin, Supervisor)
  console.log('👤 Creating users...')
  
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@sekolah.id'
  const kasirEmail = process.env.SEED_KASIR_EMAIL || 'kasir@sekolah.id'
  const supervisorEmail = process.env.SEED_SUPERVISOR_EMAIL || 'supervisor@sekolah.id'

  const adminPasswordText = process.env.SEED_ADMIN_PASSWORD || 'default_admin_pwd'
  const kasirPasswordText = process.env.SEED_KASIR_PASSWORD || 'default_kasir_pwd'
  const supervisorPasswordText = process.env.SEED_SUPERVISOR_PASSWORD || 'default_spv_pwd'

  const adminPassword = await bcryptjs.hash(adminPasswordText, 10)
  const kasirPassword = await bcryptjs.hash(kasirPasswordText, 10)
  const supervisorPassword = await bcryptjs.hash(supervisorPasswordText, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  const kasir = await prisma.user.upsert({
    where: { email: kasirEmail },
    update: {},
    create: {
      name: 'Kasir Utama',
      email: kasirEmail,
      password: kasirPassword,
      role: 'KASIR'
    }
  })

  const supervisor = await prisma.user.upsert({
    where: { email: supervisorEmail },
    update: {},
    create: {
      name: 'Supervisor Unit',
      email: supervisorEmail,
      password: supervisorPassword,
      role: 'SUPERVISOR'
    }
  })

  console.log(`✅ Created users: ${admin.name}, ${kasir.name}, ${supervisor.name}`)

  // 2. Create Outlets
  console.log('🏪 Creating outlets...')

  const smartCafe = await prisma.outlet.upsert({
    where: { name: 'SMART_CAFE' },
    update: {},
    create: { name: 'SMART_CAFE' }
  })

  const businessCenter = await prisma.outlet.upsert({
    where: { name: 'BUSINESS_CENTER' },
    update: {},
    create: { name: 'BUSINESS_CENTER' }
  })

  console.log(`✅ Created outlets: ${smartCafe.name}, ${businessCenter.name}`)

  // 3. Create Categories
  console.log('📂 Creating categories...')

  const makanan = await prisma.category.upsert({
    where: { name: 'MAKANAN' },
    update: {},
    create: { name: 'MAKANAN' }
  })

  const minuman = await prisma.category.upsert({
    where: { name: 'MINUMAN' },
    update: {},
    create: { name: 'MINUMAN' }
  })

  const atk = await prisma.category.upsert({
    where: { name: 'ATK' },
    update: {},
    create: { name: 'ATK' }
  })

  console.log(`✅ Created categories: ${makanan.name}, ${minuman.name}, ${atk.name}`)

  // 4. Create Products for Smart Cafe
  console.log('🍽️ Creating products for Smart Cafe...')

  const cafeProducts = [
    { name: 'Nasi Goreng', price: 15000, stock: 50, categoryId: makanan.id, outletId: smartCafe.id },
    { name: 'Mie Goreng', price: 12000, stock: 45, categoryId: makanan.id, outletId: smartCafe.id },
    { name: 'Nasi Ayam Geprek', price: 13000, stock: 40, categoryId: makanan.id, outletId: smartCafe.id },
    { name: 'Indomie Rebus', price: 8000, stock: 100, categoryId: makanan.id, outletId: smartCafe.id },
    { name: 'Roti Bakar Coklat', price: 10000, stock: 30, categoryId: makanan.id, outletId: smartCafe.id },
    { name: 'Pisang Goreng', price: 7000, stock: 40, categoryId: makanan.id, outletId: smartCafe.id },
    { name: 'Es Teh Manis', price: 4000, stock: 200, categoryId: minuman.id, outletId: smartCafe.id },
    { name: 'Es Jeruk', price: 5000, stock: 150, categoryId: minuman.id, outletId: smartCafe.id },
    { name: 'Es Susu', price: 6000, stock: 100, categoryId: minuman.id, outletId: smartCafe.id },
    { name: 'Kopi Susu', price: 8000, stock: 80, categoryId: minuman.id, outletId: smartCafe.id },
    { name: 'Es Coklat', price: 7000, stock: 60, categoryId: minuman.id, outletId: smartCafe.id },
    { name: 'Teh Hangat', price: 3000, stock: 200, categoryId: minuman.id, outletId: smartCafe.id },
  ]

  for (const product of cafeProducts) {
    await prisma.product.upsert({
      where: { 
        id: product.name.toLowerCase().replace(/\s+/g, '-') 
      },
      update: {},
      create: product
    })
  }

  console.log(`✅ Created ${cafeProducts.length} products for Smart Cafe`)

  // 5. Create Products for Business Center
  console.log('🖨️ Creating products for Business Center...')

  const bcProducts = [
    { name: 'Pensil 2B', price: 3000, stock: 100, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Penghapus', price: 2000, stock: 80, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Penggaris 30cm', price: 5000, stock: 50, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Buku Tulis 38 Lembar', price: 5000, stock: 200, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Buku Tulis 58 Lembar', price: 7000, stock: 150, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Bolpoin Hitam', price: 4000, stock: 120, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Bolpoin Biru', price: 4000, stock: 120, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Tipe-X', price: 5000, stock: 60, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Staples + Isi', price: 15000, stock: 30, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Map Plastik', price: 3000, stock: 100, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Kertas HVS A4 (rim)', price: 45000, stock: 40, categoryId: atk.id, outletId: businessCenter.id },
    { name: 'Binder Clip 155', price: 5000, stock: 50, categoryId: atk.id, outletId: businessCenter.id },
  ]

  for (const product of bcProducts) {
    await prisma.product.upsert({
      where: { 
        id: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') 
      },
      update: {},
      create: product
    })
  }

  console.log(`✅ Created ${bcProducts.length} products for Business Center`)

  // 6. Create Students
  console.log('👨‍🎓 Creating students...')

  const studentNames = [
    { nis: '10001', name: 'Ahmad Rizki Pratama', uid: 'A1B2C3D4' },
    { nis: '10002', name: 'Siti Nurhaliza', uid: 'B2C3D4E5' },
    { nis: '10003', name: 'Budi Santoso', uid: 'C3D4E5F6' },
    { nis: '10004', name: 'Dewi Lestari', uid: 'D4E5F6A7' },
    { nis: '10005', name: 'Eko Prasetyo', uid: 'E5F6A7B8' },
    { nis: '10006', name: 'Fitri Handayani', uid: 'F6A7B8C9' },
    { nis: '10007', name: 'Gunawan Wijaya', uid: 'A7B8C9D0' },
    { nis: '10008', name: 'Hesti Rahayu', uid: 'B8C9D0E1' },
    { nis: '10009', name: 'Irfan Hakim', uid: 'C9D0E1F2' },
    { nis: '10010', name: 'Jasmine Putri', uid: 'D0E1F2A3' },
    { nis: '10011', name: 'Kurniawan Adi', uid: 'E1F2A3B4' },
    { nis: '10012', name: 'Lina Marlina', uid: 'F2A3B4C5' },
    { nis: '10013', name: 'Muhammad Faisal', uid: 'A3B4C5D6' },
    { nis: '10014', name: 'Nurul Hidayah', uid: 'B4C5D6E7' },
    { nis: '10015', name: 'Oscar Wijaya', uid: 'C5D6E7F8' },
    { nis: '10016', name: 'Putri Amelia', uid: 'D6E7F8A9' },
    { nis: '10017', name: 'Qori Saputra', uid: 'E7F8A9B0' },
    { nis: '10018', name: 'Rina Hartati', uid: 'F8A9B0C1' },
    { nis: '10019', name: 'Surya Darma', uid: 'A9B0C1D2' },
    { nis: '10020', name: 'Tika Pertiwi', uid: 'B0C1D2E3' },
    { nis: '10021', name: 'Umar Abdullah', uid: 'C1D2E3F4' },
    { nis: '10022', name: 'Vina Rosemary', uid: 'D2E3F4A5' },
    { nis: '10023', name: 'Wahyu Setiawan', uid: 'E3F4A5B6' },
    { nis: '10024', name: 'Yuni Astuti', uid: 'F4A5B6C7' },
    { nis: '10025', name: 'Zainal Abidin', uid: 'A5B6C7D8' },
  ]

  // Random balance between 10000 and 200000
  const getRandomBalance = () => Math.floor(Math.random() * 190000) + 10000

  for (const student of studentNames) {
    await prisma.student.upsert({
      where: { nis: student.nis },
      update: {},
      create: {
        nis: student.nis,
        name: student.name,
        uid: student.uid,
        balance: getRandomBalance(),
        isActive: true,
        isBlocked: false
      }
    })
  }

  console.log(`✅ Created ${studentNames.length} students`)

  // 7. Create Sample Transactions
  console.log('💰 Creating sample transactions...')

  const students = await prisma.student.findMany({ take: 5 })
  const products = await prisma.product.findMany({ take: 5 })

  for (let i = 0; i < 10; i++) {
    const student = students[i % students.length]
    const product = products[i % products.length]
    
    const amount = product.price * (i % 3 + 1)
    const balanceBefore = student.balance + amount

    const transaction = await prisma.transaction.create({
      data: {
        studentId: student.id,
        cashierId: kasir.id,
        totalAmount: amount,
        status: 'SUCCESS',
        paymentMethod: 'RFID',
        createdAt: new Date(Date.now() - i * 86400000) // subtract days
      }
    })

    await prisma.transactionItem.create({
      data: {
        transactionId: transaction.id,
        productId: product.id,
        quantity: (i % 3 + 1),
        priceAtTime: product.price,
        subtotal: amount
      }
    })

    await prisma.mutationLog.create({
      data: {
        studentId: student.id,
        type: 'DEBIT',
        amount: -amount,
        balanceBefore,
        balanceAfter: balanceBefore - amount,
        referenceId: transaction.id,
        referenceType: 'TRANSACTION'
      }
    })

    // Update student balance
    await prisma.student.update({
      where: { id: student.id },
      data: { balance: balanceBefore - amount }
    })
  }

  console.log('✅ Created 10 sample transactions')

  // 8. Create Sample Top-ups
  console.log('💳 Creating sample top-ups...')

  const topupAmounts = [50000, 100000, 75000, 50000, 150000]
  
  for (let i = 0; i < 5; i++) {
    const student = students[i]
    const amount = topupAmounts[i]
    const balanceBefore = student.balance

    const topup = await prisma.topup.create({
      data: {
        studentId: student.id,
        adminId: admin.id,
        amount,
        method: 'CASH',
        createdAt: new Date(Date.now() - (i + 5) * 86400000)
      }
    })

    await prisma.mutationLog.create({
      data: {
        studentId: student.id,
        type: 'TOPUP',
        amount,
        balanceBefore,
        balanceAfter: balanceBefore + amount,
        referenceId: topup.id,
        referenceType: 'TOPUP',
        createdBy: admin.id
      }
    })

    await prisma.student.update({
      where: { id: student.id },
      data: { balance: balanceBefore + amount }
    })
  }

  console.log('✅ Created 5 sample top-ups')

  console.log('\n🎉 Seed completed successfully!\n')
  console.log('📋 Login credentials (set from .env or using default):')
  console.log(`   Admin:      ${adminEmail} / ${adminPasswordText}`)
  console.log(`   Kasir:      ${kasirEmail} / ${kasirPasswordText}`)
  console.log(`   Supervisor: ${supervisorEmail} / ${supervisorPasswordText}`)
  console.log('\n📌 Sample Student UIDs for testing:')
  console.log('   A1B2C3D4, B2C3D4E5, C3D4E5F6, D4E5F6A7, E5F6A7B8')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })