import { PrismaClient, Role, SellerStatus, CouponType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting BoilaBin seed...')

  // SETTINGS
  await prisma.setting.createMany({
    data: [
      { key: 'site_name', value: 'BoilaBin', group: 'general' },
      { key: 'site_tagline', value: 'Browse Products by Category in Bangladesh', group: 'general' },
      { key: 'site_email', value: 'anikhasan2@icloud.com', group: 'general' },
      { key: 'site_phone', value: '01758409063', group: 'general' },
      { key: 'site_address', value: 'Bashundhara R/A, J Block, Road 20', group: 'general' },
      { key: 'currency', value: 'BDT', group: 'general' },
      { key: 'currency_symbol', value: '৳', group: 'general' },
      { key: 'seller_mode', value: 'false', group: 'features' },
      { key: 'low_stock_alert', value: '5', group: 'inventory' },
    ],
    skipDuplicates: true,
  })

  await prisma.shippingSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', freeShippingMin: 2000, defaultFee: 60, codFee: 0 },
    update: {},
  })

  // SHIPPING ZONES
  await prisma.shippingZone.createMany({
    data: [
      { name: 'Dhaka City', divisions: ['Dhaka'], districts: ['Dhaka'], baseFee: 60, perKgFee: 0, minDays: 1, maxDays: 2 },
      { name: 'Dhaka Division', divisions: ['Dhaka'], districts: [], baseFee: 80, perKgFee: 5, minDays: 2, maxDays: 3 },
      { name: 'Chittagong Division', divisions: ['Chittagong'], districts: [], baseFee: 100, perKgFee: 8, minDays: 2, maxDays: 4 },
      { name: 'Other Divisions', divisions: [], districts: [], baseFee: 120, perKgFee: 10, minDays: 3, maxDays: 5 },
    ],
    skipDuplicates: true,
  })

  // SUPER ADMIN
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@boilabin.com' },
    update: {},
    create: {
      name: 'BoilaBin Admin',
      email: 'admin@boilabin.com',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  })

  // FIRST-PARTY SELLER
  await prisma.seller.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      storeName: 'Boilabin',
      storeSlug: 'boilabin-official',
      description: 'Boilabin product catalog and storefront.',
      status: SellerStatus.APPROVED,
      isFirstParty: true,
      commissionRate: 0,
    },
  })

  // SAMPLE CUSTOMER
  const customerPassword = await bcrypt.hash('Customer@123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Arif Rahman',
      email: 'customer@example.com',
      password: customerPassword,
      role: Role.CUSTOMER,
      phone: '01712345678',
      emailVerified: new Date(),
    },
  })

  await prisma.address.upsert({
    where: { id: 'addr-001' },
    update: {},
    create: {
      id: 'addr-001',
      userId: customer.id,
      fullName: 'Arif Rahman',
      phone: '01712345678',
      addressLine1: '42, Road 11, Banani',
      city: 'Dhaka',
      district: 'Dhaka',
      division: 'Dhaka',
      postalCode: '1213',
      isDefault: true,
    },
  })

  // CATEGORIES
  const electronics = await prisma.category.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'Electronics', slug: 'electronics', icon: 'Cpu', image: '/assets/categories/electronics.jpg', sortOrder: 1 } })
  await prisma.category.upsert({ where: { slug: 'mobile-phones' }, update: {}, create: { name: 'Mobile Phones', slug: 'mobile-phones', icon: 'Smartphone', parentId: electronics.id, sortOrder: 1 } })
  await prisma.category.upsert({ where: { slug: 'laptops' }, update: {}, create: { name: 'Laptops', slug: 'laptops', icon: 'Laptop', parentId: electronics.id, sortOrder: 2 } })
  await prisma.category.upsert({ where: { slug: 'audio' }, update: {}, create: { name: 'Audio', slug: 'audio', icon: 'Headphones', parentId: electronics.id, sortOrder: 3 } })
  await prisma.category.upsert({ where: { slug: 'wearables' }, update: {}, create: { name: 'Wearables', slug: 'wearables', icon: 'Watch', parentId: electronics.id, sortOrder: 4 } })

  const fashion = await prisma.category.upsert({ where: { slug: 'fashion' }, update: {}, create: { name: 'Fashion', slug: 'fashion', icon: 'Shirt', image: '/assets/categories/fashion.jpg', sortOrder: 2 } })
  await prisma.category.upsert({ where: { slug: 'mens-fashion' }, update: {}, create: { name: "Men's Fashion", slug: 'mens-fashion', parentId: fashion.id, sortOrder: 1 } })
  await prisma.category.upsert({ where: { slug: 'womens-fashion' }, update: {}, create: { name: "Women's Fashion", slug: 'womens-fashion', parentId: fashion.id, sortOrder: 2 } })

  const homeAppliances = await prisma.category.upsert({ where: { slug: 'home-appliances' }, update: {}, create: { name: 'Home & Appliances', slug: 'home-appliances', icon: 'Home', image: '/assets/categories/home-appliances.jpg', sortOrder: 3 } })
  await prisma.category.upsert({ where: { slug: 'kitchen' }, update: {}, create: { name: 'Kitchen', slug: 'kitchen', parentId: homeAppliances.id, sortOrder: 1 } })

  await prisma.category.upsert({ where: { slug: 'beauty-health' }, update: {}, create: { name: 'Beauty & Health', slug: 'beauty-health', icon: 'Sparkles', image: '/assets/categories/beauty-health.jpg', sortOrder: 4 } })
  await prisma.category.upsert({ where: { slug: 'sports-fitness' }, update: {}, create: { name: 'Sports & Fitness', slug: 'sports-fitness', icon: 'Dumbbell', image: '/assets/categories/sports-fitness.jpg', sortOrder: 5 } })
  await prisma.category.upsert({ where: { slug: 'books-stationery' }, update: {}, create: { name: 'Books & Stationery', slug: 'books-stationery', icon: 'BookOpen', image: '/assets/categories/books-stationery.jpg', sortOrder: 6 } })
  await prisma.category.upsert({ where: { slug: 'gaming' }, update: {}, create: { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', image: '/assets/categories/gaming.jpg', sortOrder: 7 } })
  const toysCollectibles = await prisma.category.upsert({ where: { slug: 'toys-collectibles' }, update: {}, create: { name: 'Toys & Collectibles', slug: 'toys-collectibles', icon: 'ToyBrick', image: '/assets/categories/toys-collectibles.jpg', sortOrder: 8 } })
  await prisma.category.upsert({ where: { slug: 'hot-wheels' }, update: {}, create: { name: 'Hot Wheels', slug: 'hot-wheels', parentId: toysCollectibles.id, sortOrder: 1 } })
  await prisma.category.upsert({ where: { slug: 'lego-sets' }, update: {}, create: { name: 'LEGO Sets', slug: 'lego-sets', parentId: toysCollectibles.id, sortOrder: 2 } })
  await prisma.category.upsert({ where: { slug: 'diecast-models' }, update: {}, create: { name: 'Diecast Models', slug: 'diecast-models', parentId: toysCollectibles.id, sortOrder: 3 } })
  await prisma.category.upsert({ where: { slug: 'action-figures' }, update: {}, create: { name: 'Action Figures', slug: 'action-figures', parentId: toysCollectibles.id, sortOrder: 4 } })
  await prisma.category.upsert({ where: { slug: 'collectible-cards' }, update: {}, create: { name: 'Collectible Cards', slug: 'collectible-cards', parentId: toysCollectibles.id, sortOrder: 5 } })

  // BRANDS
  await prisma.brand.upsert({ where: { slug: 'apple' }, update: {}, create: { name: 'Apple', slug: 'apple', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Apple', isFeatured: true, sortOrder: 1 } })
  await prisma.brand.upsert({ where: { slug: 'samsung' }, update: {}, create: { name: 'Samsung', slug: 'samsung', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Samsung', isFeatured: true, sortOrder: 2 } })
  await prisma.brand.upsert({ where: { slug: 'sony' }, update: {}, create: { name: 'Sony', slug: 'sony', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Sony', isFeatured: true, sortOrder: 3 } })
  await prisma.brand.upsert({ where: { slug: 'xiaomi' }, update: {}, create: { name: 'Xiaomi', slug: 'xiaomi', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Xiaomi', isFeatured: true, sortOrder: 4 } })
  await prisma.brand.upsert({ where: { slug: 'dell' }, update: {}, create: { name: 'Dell', slug: 'dell', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Dell', isFeatured: true, sortOrder: 5 } })
  await prisma.brand.upsert({ where: { slug: 'hp' }, update: {}, create: { name: 'HP', slug: 'hp', logo: 'https://placehold.co/120x60/f5f5f5/333?text=HP', isFeatured: true, sortOrder: 6 } })
  await prisma.brand.upsert({ where: { slug: 'bose' }, update: {}, create: { name: 'Bose', slug: 'bose', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Bose', isFeatured: false, sortOrder: 7 } })
  await prisma.brand.upsert({ where: { slug: 'nike' }, update: {}, create: { name: 'Nike', slug: 'nike', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Nike', isFeatured: true, sortOrder: 8 } })
  await prisma.brand.upsert({ where: { slug: 'anker' }, update: {}, create: { name: 'Anker', slug: 'anker', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Anker', isFeatured: false, sortOrder: 9 } })

  // Products and product-linked hero banners are intentionally not seeded.
  // Real catalog items should be added later from the admin panel.

  // COUPONS
  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOME10', name: 'Welcome Discount', type: CouponType.PERCENTAGE, value: 10, minOrderAmount: 1000, maxDiscount: 500, usageLimit: 1000, isActive: true, description: '10% off your first order' },
      { code: 'SAVE500', name: 'Flat ৳500 Off', type: CouponType.FIXED, value: 500, minOrderAmount: 5000, usageLimit: 500, isActive: true },
      { code: 'TECH20', name: 'Electronics 20% Off', type: CouponType.PERCENTAGE, value: 20, minOrderAmount: 10000, maxDiscount: 2000, usageLimit: 200, isActive: true },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed complete!')
  console.log('')
  console.log('  Admin:    admin@boilabin.com  / Admin@123')
  console.log('  Customer: customer@example.com / Customer@123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

