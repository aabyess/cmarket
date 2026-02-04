import { db } from "./db";
import { users, rfqs, quotes, messages } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log("Checking if database needs seeding...");

  // Check if test accounts exist
  const existingTestUser = await db.select().from(users).where(eq(users.email, 'korea@test.com')).limit(1);
  if (existingTestUser.length > 0) {
    console.log("Test accounts already exist, skipping seed.");
    return;
  }

  console.log("Seeding database with sample data and test accounts...");

  // Hash password for test accounts
  const hashedPassword = await bcrypt.hash("test123", 10);

  // Create test accounts
  const [koreanTestUser] = await db.insert(users).values({
    email: 'korea@test.com',
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'Korea',
    companyName: 'Korea Test Corp.',
    companyType: 'korean',
    businessRegistration: 'KR-TEST-001',
  }).returning();

  const [indonesianTestUser] = await db.insert(users).values({
    email: 'indonesia@test.com',
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'Indonesia',
    companyName: 'Indonesia Test Corp.',
    companyType: 'indonesian',
    businessRegistration: 'ID-TEST-001',
  }).returning();

  console.log("Created test accounts: korea@test.com and indonesia@test.com (password: test123)");

  // Use test users as demo users
  const koreanUser = koreanTestUser;
  const indonesianUser = indonesianTestUser;

  // Create sample RFQs
  const sampleRfqs = [
    {
      title: 'Industrial Manufacturing Equipment',
      description: 'Looking for high-quality manufacturing equipment for our textile factory. Need reliable Korean suppliers with international shipping experience.',
      category: 'industrial-equipment',
      quantity: 5,
      unit: 'pieces',
      budgetMin: '50000',
      budgetMax: '100000',
      deliveryLocation: 'Jakarta, Indonesia',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      targetCountry: 'korea',
      isUrgent: false,
      status: 'active',
      createdBy: indonesianUser.id,
    },
    {
      title: 'Organic Cotton Fabric Supply',
      description: 'Seeking Indonesian organic cotton suppliers for our fashion brand in Seoul. Looking for sustainable and certified organic materials.',
      category: 'textiles-apparel',
      quantity: 1000,
      unit: 'meters',
      budgetMin: '15000',
      budgetMax: '25000',
      deliveryLocation: 'Seoul, Korea',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      targetCountry: 'indonesia',
      isUrgent: true,
      status: 'pending',
      createdBy: koreanUser.id,
    },
    {
      title: 'Steel Construction Materials',
      description: 'Need high-grade steel beams and construction materials for infrastructure project in Surabaya. Require certified materials with quality guarantees.',
      category: 'construction-materials',
      quantity: 200,
      unit: 'tons',
      budgetMin: '80000',
      budgetMax: '120000',
      deliveryLocation: 'Surabaya, Indonesia',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      targetCountry: 'korea',
      isUrgent: false,
      status: 'active',
      createdBy: indonesianUser.id,
    },
    {
      title: 'Electronic Components Supply',
      description: 'Looking for reliable Indonesian suppliers of electronic components for our Korean electronics manufacturing company. Need competitive pricing.',
      category: 'electronics',
      quantity: 10000,
      unit: 'pieces',
      budgetMin: '25000',
      budgetMax: '40000',
      deliveryLocation: 'Busan, Korea',
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      targetCountry: 'indonesia',
      isUrgent: true,
      status: 'active',
      createdBy: koreanUser.id,
    },
    {
      title: 'Palm Oil Products',
      description: 'Seeking reliable Indonesian palm oil suppliers for Korean food manufacturing. Must meet international quality and sustainability standards.',
      category: 'food-beverage',
      quantity: 500,
      unit: 'tons',
      budgetMin: '150000',
      budgetMax: '200000',
      deliveryLocation: 'Incheon, Korea',
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      targetCountry: 'indonesia',
      isUrgent: false,
      status: 'active',
      createdBy: koreanUser.id,
    },
  ];

  const insertedRfqs = await db.insert(rfqs).values(sampleRfqs).returning();

  // Create sample quotes for each RFQ
  const supplierCompanies = [
    { name: 'Seoul Tech Industries', email: 'tech@seoul.kr' },
    { name: 'PT. Jakarta Supplies', email: 'supply@jakarta.id' },
    { name: 'Busan Manufacturing Co.', email: 'mfg@busan.kr' },
    { name: 'PT. Bandung Materials', email: 'materials@bandung.id' },
    { name: 'Daegu Electronics Ltd.', email: 'elec@daegu.kr' },
  ];

  // Create supplier users
  const supplierUsers = [];
  for (let i = 0; i < supplierCompanies.length; i++) {
    const company = supplierCompanies[i];
    const [supplier] = await db.insert(users).values({
      email: company.email,
      password: hashedPassword,
      firstName: 'Supplier',
      lastName: `${i + 1}`,
      companyName: company.name,
      companyType: i % 2 === 0 ? 'korean' : 'indonesian',
      businessRegistration: `SUP-${100000 + i}`,
    }).returning();
    supplierUsers.push(supplier);
  }

  // Create quotes for first 3 RFQs
  for (let i = 0; i < 3; i++) {
    const rfq = insertedRfqs[i];
    const numQuotes = Math.min(3 + i, supplierUsers.length);
    
    for (let j = 0; j < numQuotes; j++) {
      const supplier = supplierUsers[j];
      const basePrice = 10000 + (j * 2000) + (i * 5000);
      
      await db.insert(quotes).values({
        rfqId: rfq.id,
        supplierId: supplier.id,
        unitPrice: String(basePrice),
        totalAmount: String(basePrice * rfq.quantity),
        deliveryTime: `${3 + j} weeks`,
        paymentTerms: j === 0 ? '50% upfront, 50% on delivery' : j === 1 ? 'Net 30' : 'Letter of Credit',
        notes: `Professional quote from ${supplier.companyName}. We have extensive experience in this category.`,
        status: 'pending',
      });
    }
  }

  // Create sample messages for first RFQ
  const firstRfq = insertedRfqs[0];
  const firstSupplier = supplierUsers[0];

  await db.insert(messages).values([
    {
      rfqId: firstRfq.id,
      senderId: firstSupplier.id,
      receiverId: indonesianUser.id,
      content: 'Hello! I am interested in your RFQ for industrial equipment. We can provide high-quality machinery from Korea.',
    },
    {
      rfqId: firstRfq.id,
      senderId: indonesianUser.id,
      receiverId: firstSupplier.id,
      content: 'Thank you for your interest! Could you please send detailed specifications and delivery timeline?',
    },
    {
      rfqId: firstRfq.id,
      senderId: firstSupplier.id,
      receiverId: indonesianUser.id,
      content: 'Certainly! Our machines meet international standards and we can deliver within 4-6 weeks. I will prepare a detailed quote for you.',
    },
    {
      rfqId: firstRfq.id,
      senderId: indonesianUser.id,
      receiverId: firstSupplier.id,
      content: 'That sounds promising! We are looking for a reliable supplier for long-term partnership.',
    },
  ]);

  console.log("Database seeded successfully!");
  console.log(`Created ${insertedRfqs.length} RFQs`);
  console.log(`Created ${supplierUsers.length + 2} users`);
}
