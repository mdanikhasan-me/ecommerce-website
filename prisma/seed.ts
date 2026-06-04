import { PrismaClient, Role, OrderStatus, PaymentMethod, SellerStatus, CouponType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting BoilaBin seed...')

  // SETTINGS
  await prisma.setting.createMany({
    data: [
      { key: 'site_name', value: 'BoilaBin', group: 'general' },
      { key: 'site_tagline', value: 'Shop Quality Products from Trusted Sellers', group: 'general' },
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
  const firstPartySeller = await prisma.seller.upsert({
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
  const mobile = await prisma.category.upsert({ where: { slug: 'mobile-phones' }, update: {}, create: { name: 'Mobile Phones', slug: 'mobile-phones', icon: 'Smartphone', parentId: electronics.id, sortOrder: 1 } })
  const laptops = await prisma.category.upsert({ where: { slug: 'laptops' }, update: {}, create: { name: 'Laptops', slug: 'laptops', icon: 'Laptop', parentId: electronics.id, sortOrder: 2 } })
  const audio = await prisma.category.upsert({ where: { slug: 'audio' }, update: {}, create: { name: 'Audio', slug: 'audio', icon: 'Headphones', parentId: electronics.id, sortOrder: 3 } })
  const wearables = await prisma.category.upsert({ where: { slug: 'wearables' }, update: {}, create: { name: 'Wearables', slug: 'wearables', icon: 'Watch', parentId: electronics.id, sortOrder: 4 } })

  const fashion = await prisma.category.upsert({ where: { slug: 'fashion' }, update: {}, create: { name: 'Fashion', slug: 'fashion', icon: 'Shirt', image: '/assets/categories/fashion.jpg', sortOrder: 2 } })
  await prisma.category.upsert({ where: { slug: 'mens-fashion' }, update: {}, create: { name: "Men's Fashion", slug: 'mens-fashion', parentId: fashion.id, sortOrder: 1 } })
  await prisma.category.upsert({ where: { slug: 'womens-fashion' }, update: {}, create: { name: "Women's Fashion", slug: 'womens-fashion', parentId: fashion.id, sortOrder: 2 } })

  const homeAppliances = await prisma.category.upsert({ where: { slug: 'home-appliances' }, update: {}, create: { name: 'Home & Appliances', slug: 'home-appliances', icon: 'Home', image: '/assets/categories/home-appliances.jpg', sortOrder: 3 } })
  await prisma.category.upsert({ where: { slug: 'kitchen' }, update: {}, create: { name: 'Kitchen', slug: 'kitchen', parentId: homeAppliances.id, sortOrder: 1 } })

  await prisma.category.upsert({ where: { slug: 'beauty-health' }, update: {}, create: { name: 'Beauty & Health', slug: 'beauty-health', icon: 'Sparkles', image: '/assets/categories/beauty-health.jpg', sortOrder: 4 } })
  const sports = await prisma.category.upsert({ where: { slug: 'sports-fitness' }, update: {}, create: { name: 'Sports & Fitness', slug: 'sports-fitness', icon: 'Dumbbell', image: '/assets/categories/sports-fitness.jpg', sortOrder: 5 } })
  await prisma.category.upsert({ where: { slug: 'books-stationery' }, update: {}, create: { name: 'Books & Stationery', slug: 'books-stationery', icon: 'BookOpen', image: '/assets/categories/books-stationery.jpg', sortOrder: 6 } })
  const gaming = await prisma.category.upsert({ where: { slug: 'gaming' }, update: {}, create: { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', image: '/assets/categories/gaming.jpg', sortOrder: 7 } })
  const toysCollectibles = await prisma.category.upsert({ where: { slug: 'toys-collectibles' }, update: {}, create: { name: 'Toys & Collectibles', slug: 'toys-collectibles', icon: 'ToyBrick', image: '/assets/categories/toys-collectibles.jpg', sortOrder: 8 } })
  await prisma.category.upsert({ where: { slug: 'hot-wheels' }, update: {}, create: { name: 'Hot Wheels', slug: 'hot-wheels', parentId: toysCollectibles.id, sortOrder: 1 } })
  await prisma.category.upsert({ where: { slug: 'lego-sets' }, update: {}, create: { name: 'LEGO Sets', slug: 'lego-sets', parentId: toysCollectibles.id, sortOrder: 2 } })
  await prisma.category.upsert({ where: { slug: 'diecast-models' }, update: {}, create: { name: 'Diecast Models', slug: 'diecast-models', parentId: toysCollectibles.id, sortOrder: 3 } })
  await prisma.category.upsert({ where: { slug: 'action-figures' }, update: {}, create: { name: 'Action Figures', slug: 'action-figures', parentId: toysCollectibles.id, sortOrder: 4 } })
  await prisma.category.upsert({ where: { slug: 'collectible-cards' }, update: {}, create: { name: 'Collectible Cards', slug: 'collectible-cards', parentId: toysCollectibles.id, sortOrder: 5 } })

  // BRANDS
  const apple = await prisma.brand.upsert({ where: { slug: 'apple' }, update: {}, create: { name: 'Apple', slug: 'apple', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Apple', isFeatured: true, sortOrder: 1 } })
  const samsung = await prisma.brand.upsert({ where: { slug: 'samsung' }, update: {}, create: { name: 'Samsung', slug: 'samsung', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Samsung', isFeatured: true, sortOrder: 2 } })
  const sony = await prisma.brand.upsert({ where: { slug: 'sony' }, update: {}, create: { name: 'Sony', slug: 'sony', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Sony', isFeatured: true, sortOrder: 3 } })
  const xiaomi = await prisma.brand.upsert({ where: { slug: 'xiaomi' }, update: {}, create: { name: 'Xiaomi', slug: 'xiaomi', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Xiaomi', isFeatured: true, sortOrder: 4 } })
  const dell = await prisma.brand.upsert({ where: { slug: 'dell' }, update: {}, create: { name: 'Dell', slug: 'dell', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Dell', isFeatured: true, sortOrder: 5 } })
  const hp = await prisma.brand.upsert({ where: { slug: 'hp' }, update: {}, create: { name: 'HP', slug: 'hp', logo: 'https://placehold.co/120x60/f5f5f5/333?text=HP', isFeatured: true, sortOrder: 6 } })
  const bose = await prisma.brand.upsert({ where: { slug: 'bose' }, update: {}, create: { name: 'Bose', slug: 'bose', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Bose', isFeatured: false, sortOrder: 7 } })
  const nike = await prisma.brand.upsert({ where: { slug: 'nike' }, update: {}, create: { name: 'Nike', slug: 'nike', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Nike', isFeatured: true, sortOrder: 8 } })
  const anker = await prisma.brand.upsert({ where: { slug: 'anker' }, update: {}, create: { name: 'Anker', slug: 'anker', logo: 'https://placehold.co/120x60/f5f5f5/333?text=Anker', isFeatured: false, sortOrder: 9 } })

  // PRODUCTS
  type ProductSeed = {
    sku: string; name: string; slug: string; description: string; shortDescription: string;
    categoryId: string; brandId: string; sellerId: string; basePrice: number; salePrice?: number;
    stockQuantity: number; isFeatured?: boolean; isNew?: boolean; isBestSeller?: boolean;
    tags: string[]; rating?: number; reviewCount?: number; soldCount?: number;
    imageUrl: string; specifications?: { group?: string; name: string; value: string }[];
  }

  const productsData: ProductSeed[] = [
    {
      sku: 'IPH-15P-128', name: 'iPhone 15 Pro 128GB', slug: 'iphone-15-pro-128gb',
      description: 'The iPhone 15 Pro features a titanium design, A17 Pro chip, and a Pro camera system. The most powerful iPhone yet with a new Action button and USB 3 speeds.',
      shortDescription: 'Titanium design, A17 Pro chip, 48MP camera system.',
      categoryId: mobile.id, brandId: apple.id, sellerId: firstPartySeller.id,
      basePrice: 149900, salePrice: 144900, stockQuantity: 50,
      isFeatured: true, isNew: true, isBestSeller: true,
      tags: ['iphone', 'apple', 'smartphone', '5g', 'pro'],
      rating: 4.8, reviewCount: 124, soldCount: 89,
      imageUrl: '/assets/banners/home-hero-iphone-15-pro.jpg',
      specifications: [
        { group: 'Display', name: 'Screen Size', value: '6.1 inches' },
        { group: 'Display', name: 'Resolution', value: '2556 x 1179 pixels' },
        { group: 'Performance', name: 'Chip', value: 'Apple A17 Pro' },
        { group: 'Camera', name: 'Main Camera', value: '48MP + 12MP + 12MP' },
        { group: 'Storage', name: 'Storage', value: '128GB' },
        { group: 'Battery', name: 'Battery Life', value: 'Up to 23 hours video playback' },
      ]
    },
    {
      sku: 'SAM-S24U-256', name: 'Samsung Galaxy S24 Ultra 256GB', slug: 'samsung-galaxy-s24-ultra-256gb',
      description: 'Galaxy AI is here. The Galaxy S24 Ultra brings you closer to what matters most with Galaxy AI built in, a built-in S Pen, titanium frame, and an improved 200MP camera.',
      shortDescription: 'Galaxy AI, built-in S Pen, 200MP camera, titanium frame.',
      categoryId: mobile.id, brandId: samsung.id, sellerId: firstPartySeller.id,
      basePrice: 175000, salePrice: 169000, stockQuantity: 35,
      isFeatured: true, isNew: true, isBestSeller: false,
      tags: ['samsung', 'galaxy', 'android', 'flagship', 's-pen'],
      rating: 4.7, reviewCount: 98, soldCount: 67,
      imageUrl: '/uploads/products/samsung-galaxy-s24-ultra-256gb-mnyzjwut-55e72c0c.jpg',
      specifications: [
        { group: 'Display', name: 'Screen Size', value: '6.8 inches' },
        { group: 'Display', name: 'Technology', value: 'Dynamic AMOLED 2X, 120Hz' },
        { group: 'Camera', name: 'Main Camera', value: '200MP + 12MP + 10MP + 50MP' },
        { group: 'Storage', name: 'Storage', value: '256GB' },
      ]
    },
    {
      sku: 'XIA-BUDS4-PRO', name: 'Xiaomi Buds 4 Pro', slug: 'xiaomi-buds-4-pro',
      description: 'Xiaomi Buds 4 Pro delivers premium audio with 48dB Adaptive ANC, ultra-low latency gaming mode, and up to 38 hours total battery life.',
      shortDescription: '48dB ANC, Hi-Res Audio, 38H battery, premium audio.',
      categoryId: audio.id, brandId: xiaomi.id, sellerId: firstPartySeller.id,
      basePrice: 18500, salePrice: 15900, stockQuantity: 120,
      isFeatured: true, isNew: false, isBestSeller: true,
      tags: ['earbuds', 'wireless', 'anc', 'xiaomi', 'audio'],
      rating: 4.5, reviewCount: 203, soldCount: 312,
      imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format',
      specifications: [
        { name: 'Driver Size', value: '11mm + 6mm dual dynamic' },
        { name: 'ANC', value: 'Up to 48dB' },
        { name: 'Battery Life', value: '9H + 29H with case' },
        { name: 'Connectivity', value: 'Bluetooth 5.3' },
      ]
    },
    {
      sku: 'SONY-WH1000XM5', name: 'Sony WH-1000XM5 Wireless Headphones', slug: 'sony-wh-1000xm5',
      description: 'Industry-leading noise canceling with two processors and 8 microphones. Up to 30-hour battery life with quick charging. Crystal clear hands-free calling.',
      shortDescription: 'Industry-leading ANC, 30H battery, Hi-Res Audio.',
      categoryId: audio.id, brandId: sony.id, sellerId: firstPartySeller.id,
      basePrice: 42000, salePrice: 36500, stockQuantity: 45,
      isFeatured: true, isNew: false, isBestSeller: true,
      tags: ['headphones', 'anc', 'wireless', 'sony', 'premium'],
      rating: 4.9, reviewCount: 456, soldCount: 234,
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format',
    },
    {
      sku: 'DELL-XPS15-9520', name: 'Dell XPS 15 9520 Core i7 OLED', slug: 'dell-xps-15-9520-i7-oled',
      description: 'The Dell XPS 15 is a powerhouse laptop featuring a stunning 15.6" OLED display, Intel Core i7-12700H, 16GB DDR5 RAM, and NVIDIA GeForce RTX 3050 Ti.',
      shortDescription: '15.6" OLED, Intel i7-12700H, 16GB RAM, RTX 3050 Ti.',
      categoryId: laptops.id, brandId: dell.id, sellerId: firstPartySeller.id,
      basePrice: 185000, stockQuantity: 20,
      isFeatured: true, isNew: false, isBestSeller: false,
      tags: ['laptop', 'dell', 'xps', 'oled', 'intel', 'creator'],
      rating: 4.7, reviewCount: 87, soldCount: 43,
      imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format',
    },
    {
      sku: 'HP-SPEC-X360-14', name: 'HP Spectre x360 14 2-in-1 Laptop', slug: 'hp-spectre-x360-14',
      description: 'The HP Spectre x360 14 is a premium 2-in-1 convertible with an Intel Evo platform, OLED touch display, and exceptional battery life up to 17 hours.',
      shortDescription: '2-in-1 convertible, Intel Evo, OLED touch, 17H battery.',
      categoryId: laptops.id, brandId: hp.id, sellerId: firstPartySeller.id,
      basePrice: 165000, salePrice: 158000, stockQuantity: 15,
      isFeatured: false, isNew: true, isBestSeller: false,
      tags: ['laptop', 'hp', '2-in-1', 'oled', 'touch'],
      rating: 4.6, reviewCount: 62, soldCount: 28,
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format',
    },
    {
      sku: 'APL-WATCH-S9-41', name: 'Apple Watch Series 9 41mm', slug: 'apple-watch-series-9-41mm',
      description: 'Apple Watch Series 9 features the powerful S9 chip, a brighter Always-On Retina display, double tap gesture, and precise location with second-gen Ultra Wideband chip.',
      shortDescription: 'S9 chip, Double Tap, 2,000 nit display, crash detection.',
      categoryId: wearables.id, brandId: apple.id, sellerId: firstPartySeller.id,
      basePrice: 68000, salePrice: 65000, stockQuantity: 60,
      isFeatured: true, isNew: true, isBestSeller: true,
      tags: ['smartwatch', 'apple', 'health', 'fitness'],
      rating: 4.8, reviewCount: 178, soldCount: 156,
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format',
    },
    {
      sku: 'SAM-GALAXYW6-44', name: 'Samsung Galaxy Watch 6 Classic 44mm', slug: 'samsung-galaxy-watch-6-classic-44mm',
      description: 'Galaxy Watch6 Classic brings back the iconic rotating bezel with advanced health tracking, enhanced sleep analysis, and compatibility with Android phones.',
      shortDescription: 'Rotating bezel, BioActive sensor, sleep coach, Android.',
      categoryId: wearables.id, brandId: samsung.id, sellerId: firstPartySeller.id,
      basePrice: 52000, salePrice: 47500, stockQuantity: 40,
      isFeatured: false, isNew: false, isBestSeller: true,
      tags: ['smartwatch', 'samsung', 'android', 'health'],
      rating: 4.6, reviewCount: 134, soldCount: 98,
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format',
    },
    {
      sku: 'ANK-PWR-BANK-20K', name: 'Anker 737 Power Bank 24000mAh', slug: 'anker-737-power-bank-24000mah',
      description: '24,000mAh high-speed portable charger with 140W output, smart touchscreen displaying battery level, charge time, and wattage.',
      shortDescription: '24000mAh, 140W output, smart touchscreen display.',
      categoryId: electronics.id, brandId: anker.id, sellerId: firstPartySeller.id,
      basePrice: 12500, salePrice: 10900, stockQuantity: 200,
      isFeatured: false, isNew: false, isBestSeller: true,
      tags: ['powerbank', 'anker', 'charger', 'fast-charge'],
      rating: 4.7, reviewCount: 523, soldCount: 876,
      imageUrl: '/uploads/products/anker-737-power-bank-24000mah-mnyzif42-a41aa5a6.webp',
    },
    {
      sku: 'SONY-PS5-SLIM', name: 'Sony PlayStation 5 Slim Console', slug: 'sony-playstation-5-slim',
      description: 'The PS5 Slim features a sleek new design, 1TB SSD storage, and the DualSense wireless controller with haptic feedback and adaptive triggers.',
      shortDescription: '1TB SSD, DualSense controller, 4K gaming, 8K ready.',
      categoryId: gaming.id, brandId: sony.id, sellerId: firstPartySeller.id,
      basePrice: 75000, stockQuantity: 25,
      isFeatured: true, isNew: true, isBestSeller: true,
      tags: ['playstation', 'console', 'gaming', 'sony', 'ps5'],
      rating: 4.9, reviewCount: 312, soldCount: 189,
      imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&auto=format',
    },
    {
      sku: 'XIA-PAD6-128', name: 'Xiaomi Pad 6 128GB WiFi', slug: 'xiaomi-pad-6-128gb-wifi',
      description: 'Xiaomi Pad 6 features an 11" 2.8K 144Hz display, Snapdragon 870 processor, and 8840mAh battery with support for 33W fast charging.',
      shortDescription: '11" 2.8K 144Hz, Snapdragon 870, 8840mAh battery.',
      categoryId: electronics.id, brandId: xiaomi.id, sellerId: firstPartySeller.id,
      basePrice: 38000, salePrice: 33500, stockQuantity: 55,
      isFeatured: false, isNew: false, isBestSeller: false,
      tags: ['tablet', 'xiaomi', 'android', 'pad'],
      rating: 4.5, reviewCount: 89, soldCount: 112,
      imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format',
    },
    {
      sku: 'NIKE-AIR-MAX-270', name: 'Nike Air Max 270 Running Shoes', slug: 'nike-air-max-270-running-shoes',
      description: 'The Nike Air Max 270 features Nike\'s tallest Air unit ever for incredible underfoot cushioning. Designed for all-day wear with a breathable mesh upper.',
      shortDescription: 'Tallest Air unit, breathable mesh, all-day comfort.',
      categoryId: sports.id, brandId: nike.id, sellerId: firstPartySeller.id,
      basePrice: 14500, salePrice: 12900, stockQuantity: 150,
      isFeatured: false, isNew: false, isBestSeller: true,
      tags: ['shoes', 'nike', 'running', 'airmax', 'sports'],
      rating: 4.6, reviewCount: 287, soldCount: 456,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format',
    },
    {
      sku: 'BOSE-QC45', name: 'Bose QuietComfort 45 Headphones', slug: 'bose-quietcomfort-45-headphones',
      description: 'Bose QuietComfort 45 headphones deliver world-class noise cancellation, lifelike audio, and all-day comfort with up to 24 hours of battery life.',
      shortDescription: 'World-class ANC, 24H battery, premium comfort.',
      categoryId: audio.id, brandId: bose.id, sellerId: firstPartySeller.id,
      basePrice: 35000, salePrice: 31500, stockQuantity: 38,
      isFeatured: false, isNew: false, isBestSeller: false,
      tags: ['headphones', 'bose', 'anc', 'wireless', 'premium'],
      rating: 4.8, reviewCount: 345, soldCount: 178,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format',
    },
    {
      sku: 'SAM-55QN90C-TV', name: 'Samsung 55" Neo QLED 4K Smart TV QN90C', slug: 'samsung-55-neo-qled-qn90c',
      description: 'Samsung Neo QLED 4K TV with Quantum Matrix Technology Pro, Neural Quantum Processor 4K, and Object Tracking Sound+ for an immersive viewing experience.',
      shortDescription: 'Neo QLED, Quantum Matrix Pro, AI 4K upscaling, OTS+.',
      categoryId: homeAppliances.id, brandId: samsung.id, sellerId: firstPartySeller.id,
      basePrice: 175000, salePrice: 158000, stockQuantity: 12,
      isFeatured: true, isNew: false, isBestSeller: false,
      tags: ['tv', 'samsung', 'qled', '4k', 'smart-tv'],
      rating: 4.7, reviewCount: 134, soldCount: 45,
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format',
    },
    {
      sku: 'SONY-A7IV-BODY', name: 'Sony Alpha a7 IV Mirrorless Camera Body', slug: 'sony-alpha-a7-iv-mirrorless-body',
      description: 'The Sony Alpha 7 IV is a full-frame mirrorless camera with 33MP sensor, real-time autofocus tracking, 4K 60p video, and dual card slots.',
      shortDescription: '33MP full-frame, 4K 60p, real-time AF, weather-sealed.',
      categoryId: electronics.id, brandId: sony.id, sellerId: firstPartySeller.id,
      basePrice: 285000, stockQuantity: 8,
      isFeatured: false, isNew: false, isBestSeller: false,
      tags: ['camera', 'sony', 'mirrorless', 'fullframe', 'photography'],
      rating: 4.9, reviewCount: 76, soldCount: 34,
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format',
    },
    {
      sku: 'XIA-MI-BAND8', name: 'Xiaomi Mi Smart Band 8', slug: 'xiaomi-mi-smart-band-8',
      description: 'Mi Smart Band 8 features a 1.62" AMOLED display, 150+ sports modes, 16-day battery life, and SpO2/heart rate monitoring.',
      shortDescription: '1.62" AMOLED, 150+ sports, 16-day battery, health tracking.',
      categoryId: wearables.id, brandId: xiaomi.id, sellerId: firstPartySeller.id,
      basePrice: 5500, salePrice: 4499, stockQuantity: 300,
      isFeatured: false, isNew: true, isBestSeller: true,
      tags: ['fitness-band', 'xiaomi', 'health', 'budget'],
      rating: 4.4, reviewCount: 678, soldCount: 1234,
      imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format',
    },
    {
      sku: 'ANK-NANO-65W', name: 'Anker 511 Nano Pro 65W USB-C Charger', slug: 'anker-511-nano-pro-65w-charger',
      description: 'The Anker Nano Pro 65W is the smallest 65W GaN charger. Power laptops, phones, and tablets simultaneously with PIQ 3.0 technology.',
      shortDescription: 'Smallest 65W GaN charger, multi-device, foldable plug.',
      categoryId: electronics.id, brandId: anker.id, sellerId: firstPartySeller.id,
      basePrice: 3200, salePrice: 2799, stockQuantity: 400,
      isFeatured: false, isNew: false, isBestSeller: true,
      tags: ['charger', 'anker', 'usb-c', 'gan', 'fast-charge'],
      rating: 4.7, reviewCount: 892, soldCount: 2134,
      imageUrl: '/uploads/products/anker-511-nano-pro-65w-charger-mnyzoikz-37e76524.jpg',
    },
    {
      sku: 'APL-AIRPODS-PRO2', name: 'Apple AirPods Pro (2nd Generation)', slug: 'apple-airpods-pro-2nd-gen',
      description: 'AirPods Pro (2nd gen) feature H2 chip, up to 2× more ANC than the previous generation, Adaptive Transparency, and 30 hours total listening time.',
      shortDescription: 'H2 chip, 2× ANC, Adaptive Transparency, 30H total.',
      categoryId: audio.id, brandId: apple.id, sellerId: firstPartySeller.id,
      basePrice: 32000, salePrice: 29900, stockQuantity: 80,
      isFeatured: true, isNew: false, isBestSeller: true,
      tags: ['airpods', 'apple', 'earbuds', 'anc', 'wireless'],
      rating: 4.8, reviewCount: 567, soldCount: 445,
      imageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&auto=format',
    },
    {
      sku: 'DELL-MON-27-4K', name: 'Dell UltraSharp 27" 4K USB-C Monitor U2723DE', slug: 'dell-ultrasharp-27-4k-usb-c-u2723de',
      description: 'Dell UltraSharp 27 4K USB-C Hub Monitor with IPS Black technology delivering exceptional contrast, 100% sRGB and Rec. 709, and USB-C 90W charging.',
      shortDescription: '27" 4K IPS Black, 100% sRGB, USB-C 90W, built-in hub.',
      categoryId: laptops.id, brandId: dell.id, sellerId: firstPartySeller.id,
      basePrice: 95000, salePrice: 89000, stockQuantity: 18,
      isFeatured: false, isNew: true, isBestSeller: false,
      tags: ['monitor', 'dell', '4k', 'usb-c', 'ultrasharp'],
      rating: 4.8, reviewCount: 89, soldCount: 56,
      imageUrl: '/uploads/products/dell-ultrasharp-27-4k-usb-c-u2723de-mnyzrjgz-759f7168.jpg',
    },
    {
      sku: 'SAM-GALAXY-TAB-S9', name: 'Samsung Galaxy Tab S9 128GB WiFi', slug: 'samsung-galaxy-tab-s9-128gb',
      description: 'Galaxy Tab S9 features a Dynamic AMOLED 2X display, IP68 water resistance, Snapdragon 8 Gen 2, and includes the S Pen for a premium tablet experience.',
      shortDescription: 'Dynamic AMOLED 2X, IP68, Snapdragon 8 Gen 2, S Pen included.',
      categoryId: electronics.id, brandId: samsung.id, sellerId: firstPartySeller.id,
      basePrice: 92000, salePrice: 85000, stockQuantity: 30,
      isFeatured: true, isNew: true, isBestSeller: false,
      tags: ['tablet', 'samsung', 'android', 's-pen', 'flagship'],
      rating: 4.7, reviewCount: 143, soldCount: 78,
      imageUrl: '/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwuo-057009f0.jpg',
    },
    {
      sku: 'XIA-REDMI-NOTE13PRO', name: 'Xiaomi Redmi Note 13 Pro 256GB', slug: 'xiaomi-redmi-note-13-pro-256gb',
      description: 'Redmi Note 13 Pro features a 200MP OIS camera, 6.67" curved AMOLED display, 120W HyperCharge, and 5100mAh battery at a mid-range price.',
      shortDescription: '200MP OIS camera, 120W charge, 6.67" AMOLED, 5100mAh.',
      categoryId: mobile.id, brandId: xiaomi.id, sellerId: firstPartySeller.id,
      basePrice: 42000, salePrice: 38500, stockQuantity: 85,
      isFeatured: false, isNew: true, isBestSeller: false,
      tags: ['xiaomi', 'redmi', 'smartphone', 'camera-phone', 'midrange'],
      rating: 4.5, reviewCount: 234, soldCount: 312,
      imageUrl: '/uploads/products/xiaomi-redmi-note-13-pro-256gb-mnyvj84s-d6198d84.webp',
    },
  ]

  console.log(`  Creating ${productsData.length} products...`)
  for (const p of productsData) {
    const {
      specifications,
      imageUrl,
      rating: _rating,
      reviewCount: _reviewCount,
      soldCount: _soldCount,
      ...productData
    } = p
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        ...productData,
        rating: 0,
        reviewCount: 0,
        soldCount: 0,
        viewCount: 0,
        images: { create: [{ url: imageUrl, isPrimary: true, sortOrder: 0 }] },
        specifications: specifications ? {
          create: specifications.map((s, i) => ({ ...s, sortOrder: i }))
        } : undefined,
      },
    })

    // Add color/size variants for clothing and shoes
    if (p.categoryId === sports.id && p.sku.includes('NIKE')) {
      const sizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10']
      for (const size of sizes) {
        await prisma.productVariant.upsert({
          where: { sku: `${p.sku}-${size.replace(' ', '')}` },
          update: {},
          create: {
            productId: product.id,
            name: `Size ${size}`,
            sku: `${p.sku}-${size.replace(' ', '')}`,
            stockQuantity: 20,
            options: {
              create: [{ name: 'Size', value: size }]
            }
          }
        })
      }
    }
  }

  // BANNERS
  await prisma.banner.createMany({
    data: [
      {
        title: 'The New iPhone 15 Pro',
        subtitle: 'Titanium. A17 Pro. Now in Bangladesh.',
        imageUrl: '/assets/banners/home-hero-iphone-15-pro.jpg',
        linkUrl: '/products/iphone-15-pro-128gb',
        position: 'hero',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: 'Galaxy S24 Ultra',
        subtitle: 'Galaxy AI is here. Experience the future.',
        imageUrl: '/assets/banners/home-hero-galaxy-s24-ultra.jpg',
        linkUrl: '/products/samsung-galaxy-s24-ultra-256gb',
        position: 'hero',
        sortOrder: 2,
        isActive: true,
      },
      {
        title: 'Sony WH-1000XM5',
        subtitle: 'Silence the world. Hear what matters.',
        imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1600&auto=format',
        linkUrl: '/products/sony-wh-1000xm5',
        position: 'hero',
        sortOrder: 3,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  })

  // COUPONS
  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOME10', name: 'Welcome Discount', type: CouponType.PERCENTAGE, value: 10, minOrderAmount: 1000, maxDiscount: 500, usageLimit: 1000, isActive: true, description: '10% off your first order' },
      { code: 'SAVE500', name: 'Flat ৳500 Off', type: CouponType.FIXED, value: 500, minOrderAmount: 5000, usageLimit: 500, isActive: true },
      { code: 'TECH20', name: 'Electronics 20% Off', type: CouponType.PERCENTAGE, value: 20, minOrderAmount: 10000, maxDiscount: 2000, usageLimit: 200, isActive: true },
    ],
    skipDuplicates: true,
  })

  // SAMPLE ORDER
  const sampleProduct = await prisma.product.findFirst({ where: { sku: 'APL-AIRPODS-PRO2' } })
  if (sampleProduct) {
    await prisma.order.upsert({
      where: { orderNumber: 'ZN-2024-00001' },
      update: {},
      create: {
        orderNumber: 'ZN-2024-00001',
        userId: customer.id,
        addressId: 'addr-001',
        subtotal: 29900,
        shippingFee: 0,
        total: 29900,
        status: OrderStatus.DELIVERED,
        paymentMethod: PaymentMethod.BKASH,
        deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        items: {
          create: [{
            productId: sampleProduct.id,
            productName: sampleProduct.name,
            productSku: sampleProduct.sku,
            price: 29900,
            quantity: 1,
            total: 29900,
            imageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
          }]
        }
      }
    })
  }

  console.log('✅ Seed complete!')
  console.log('')
  console.log('  Admin:    admin@boilabin.com  / Admin@123')
  console.log('  Customer: customer@example.com / Customer@123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

