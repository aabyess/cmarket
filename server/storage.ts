import {
  users,
  rfqs,
  quotes,
  orders,
  messages,
  ratings,
  type User,
  type UpsertUser,
  type InsertRfq,
  type Rfq,
  type InsertQuote,
  type Quote,
  type InsertOrder,
  type Order,
  type InsertMessage,
  type Message,
  type InsertRating,
  type Rating,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User>;
  
  // RFQ operations
  createRfq(rfq: InsertRfq, userId: string): Promise<Rfq>;
  getRfqs(userId?: string): Promise<Rfq[]>;
  getRfq(id: string): Promise<Rfq | undefined>;
  updateRfqStatus(id: string, status: string): Promise<void>;
  
  // Quote operations
  createQuote(quote: InsertQuote, supplierId: string): Promise<Quote>;
  getQuotesByRfq(rfqId: string): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  updateQuoteStatus(id: string, status: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  updateOrderPaymentIntent(id: string, paymentIntentId: string): Promise<void>;
  markOrderDelivered(id: string): Promise<void>;
  completeOrder(id: string): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage, senderId: string): Promise<Message>;
  getMessagesByRfq(rfqId: string): Promise<Message[]>;
  
  // Rating operations
  createRating(rating: InsertRating, raterId: string): Promise<Rating>;
  getRatingsByUser(userId: string): Promise<Rating[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // RFQ operations
  async createRfq(rfq: InsertRfq, userId: string): Promise<Rfq> {
    const [newRfq] = await db
      .insert(rfqs)
      .values({ ...rfq, createdBy: userId })
      .returning();
    return newRfq;
  }

  async getRfqs(userId?: string): Promise<Rfq[]> {
    const query = db.select().from(rfqs);
    let results;
    if (userId) {
      results = await query.where(eq(rfqs.createdBy, userId)).orderBy(desc(rfqs.createdAt));
    } else {
      results = await query.orderBy(desc(rfqs.createdAt));
    }

    // If user has no RFQs, add mock data for demonstration
    if (userId && results.length === 0) {
      const mockRfqs: Rfq[] = [
        {
          id: 'mock-rfq-1',
          title: 'Industrial Manufacturing Equipment',
          description: 'Looking for high-quality manufacturing equipment for our textile factory. Need reliable Korean suppliers with international shipping experience.',
          category: 'industrial-equipment',
          quantity: 5,
          unit: 'pieces',
          budgetMin: '50000',
          budgetMax: '100000',
          deliveryLocation: 'Cairo, Egypt',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          targetCountry: 'korea',
          isUrgent: false,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-2',
          title: 'Organic Cotton Fabric Supply',
          description: 'Seeking Egyptian organic cotton suppliers for our fashion brand in Seoul. Looking for sustainable and certified organic materials.',
          category: 'textiles-apparel',
          quantity: 1000,
          unit: 'meters',
          budgetMin: '15000',
          budgetMax: '25000',
          deliveryLocation: 'Seoul, Korea',
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          targetCountry: 'egypt',
          isUrgent: true,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-3',
          title: 'Steel Construction Materials',
          description: 'Need high-grade steel beams and construction materials for infrastructure project in Alexandria. Require certified materials with quality guarantees.',
          category: 'construction-materials',
          quantity: 200,
          unit: 'tons',
          budgetMin: '80000',
          budgetMax: '120000',
          deliveryLocation: 'Alexandria, Egypt',
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          targetCountry: 'korea',
          isUrgent: false,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-4',
          title: 'Electronic Components Supply',
          description: 'Looking for reliable Egyptian suppliers of electronic components for our Korean electronics manufacturing company. Need competitive pricing.',
          category: 'electronics',
          quantity: 10000,
          unit: 'pieces',
          budgetMin: '25000',
          budgetMax: '40000',
          deliveryLocation: 'Busan, Korea',
          deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          targetCountry: 'egypt',
          isUrgent: true,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-5',
          title: 'Logistics and Shipping Services',
          description: 'Require comprehensive logistics services for regular shipments between Korea and Egypt. Looking for reliable partners with competitive rates.',
          category: 'logistics-services',
          quantity: 12,
          unit: 'containers',
          budgetMin: '15000',
          budgetMax: '22000',
          deliveryLocation: 'Port Said, Egypt',
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          targetCountry: 'both',
          isUrgent: false,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-6',
          title: 'Premium Coffee Bean Import',
          description: 'Korean coffee roasting company seeking high-quality Egyptian coffee beans. Need organic certification and consistent supply.',
          category: 'other',
          quantity: 2000,
          unit: 'kg',
          budgetMin: '8000',
          budgetMax: '12000',
          deliveryLocation: 'Seoul, Korea',
          deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
          targetCountry: 'egypt',
          isUrgent: false,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-7',
          title: 'Automotive Parts Manufacturing',
          description: 'Egyptian automotive company needs precision-manufactured parts from Korean suppliers. Require ISO certification and quality assurance.',
          category: 'industrial-equipment',
          quantity: 500,
          unit: 'pieces',
          budgetMin: '35000',
          budgetMax: '55000',
          deliveryLocation: 'Cairo, Egypt',
          deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
          targetCountry: 'korea',
          isUrgent: true,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-8',
          title: 'Pharmaceutical Ingredients',
          description: 'Korean pharmaceutical company seeking raw materials from certified Egyptian suppliers. Must comply with international standards.',
          category: 'other',
          quantity: 1500,
          unit: 'kg',
          budgetMin: '45000',
          budgetMax: '65000',
          deliveryLocation: 'Incheon, Korea',
          deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
          targetCountry: 'egypt',
          isUrgent: false,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-9',
          title: 'Solar Panel Installation Equipment',
          description: 'Large-scale solar energy project in Egypt requires specialized Korean installation equipment and technical support.',
          category: 'industrial-equipment',
          quantity: 20,
          unit: 'pieces',
          budgetMin: '75000',
          budgetMax: '95000',
          deliveryLocation: 'Aswan, Egypt',
          deadline: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
          targetCountry: 'korea',
          isUrgent: false,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-10',
          title: 'Luxury Leather Goods Materials',
          description: 'Korean luxury brand seeking premium Egyptian leather materials for handbags and accessories. Need consistent quality and timely delivery.',
          category: 'textiles-apparel',
          quantity: 800,
          unit: 'meters',
          budgetMin: '18000',
          budgetMax: '28000',
          deliveryLocation: 'Seoul, Korea',
          deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
          targetCountry: 'egypt',
          isUrgent: true,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-11',
          title: 'Marine Construction Services',
          description: 'Egyptian port expansion project needs Korean marine construction expertise and specialized equipment. Long-term partnership opportunity.',
          category: 'construction-materials',
          quantity: 1,
          unit: 'project',
          budgetMin: '200000',
          budgetMax: '350000',
          deliveryLocation: 'Suez Canal, Egypt',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          targetCountry: 'korea',
          isUrgent: false,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-12',
          title: 'Smart City Technology Solutions',
          description: 'Egyptian smart city initiative requires Korean IoT sensors and smart infrastructure technology. Advanced technical specifications needed.',
          category: 'electronics',
          quantity: 1000,
          unit: 'pieces',
          budgetMin: '85000',
          budgetMax: '125000',
          deliveryLocation: 'New Administrative Capital, Egypt',
          deadline: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
          targetCountry: 'korea',
          isUrgent: true,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-13',
          title: 'Refrigerated Transport Services',
          description: 'Korean food import company needs refrigerated logistics services for Egyptian food products. Temperature-controlled shipping essential.',
          category: 'logistics-services',
          quantity: 24,
          unit: 'containers',
          budgetMin: '32000',
          budgetMax: '48000',
          deliveryLocation: 'Busan Port, Korea',
          deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          targetCountry: 'egypt',
          isUrgent: false,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-14',
          title: 'Ceramic Tiles and Flooring',
          description: 'Korean construction company seeks Egyptian ceramic tiles and premium flooring materials for luxury hotel projects. Design flexibility important.',
          category: 'construction-materials',
          quantity: 5000,
          unit: 'meters',
          budgetMin: '42000',
          budgetMax: '62000',
          deliveryLocation: 'Seoul, Korea',
          deadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
          targetCountry: 'egypt',
          isUrgent: false,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'mock-rfq-15',
          title: 'Medical Equipment Maintenance',
          description: 'Egyptian hospitals need Korean medical equipment maintenance services and spare parts. Certified technicians and warranty support required.',
          category: 'other',
          quantity: 50,
          unit: 'pieces',
          budgetMin: '28000',
          budgetMax: '38000',
          deliveryLocation: 'Cairo, Egypt',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          targetCountry: 'korea',
          isUrgent: true,
          status: 'active',
          attachments: null,
          createdBy: userId,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        }
      ];
      return mockRfqs;
    }

    return results;
  }

  async getRfq(id: string): Promise<Rfq | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
    
    // If not found in database and it's a mock RFQ, return mock data
    if (!rfq && id.startsWith('mock-rfq-')) {
      const mockRfqs = await this.getRfqs('33507990'); // Get mock data
      return mockRfqs.find(rfq => rfq.id === id);
    }
    
    return rfq;
  }

  async updateRfqStatus(id: string, status: string): Promise<void> {
    await db
      .update(rfqs)
      .set({ status, updatedAt: new Date() })
      .where(eq(rfqs.id, id));
  }

  // Quote operations
  async createQuote(quote: InsertQuote, supplierId: string): Promise<Quote> {
    const [newQuote] = await db
      .insert(quotes)
      .values({ ...quote, supplierId })
      .returning();
    return newQuote;
  }

  async getQuotesByRfq(rfqId: string): Promise<Quote[]> {
    const results = await db
      .select()
      .from(quotes)
      .where(eq(quotes.rfqId, rfqId))
      .orderBy(desc(quotes.createdAt));
    
    // If no quotes found and it's a mock RFQ, return empty array for now
    // (Could add mock quotes here in the future if needed)
    return results;
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async updateQuoteStatus(id: string, status: string): Promise<void> {
    await db
      .update(quotes)
      .set({ status, updatedAt: new Date() })
      .where(eq(quotes.id, id));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(or(eq(orders.buyerId, userId), eq(orders.supplierId, userId)))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  async updateOrderPaymentIntent(id: string, paymentIntentId: string): Promise<void> {
    await db
      .update(orders)
      .set({ paymentIntentId, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  async markOrderDelivered(id: string): Promise<void> {
    await db
      .update(orders)
      .set({ 
        status: 'delivered', 
        deliveredAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(orders.id, id));
  }

  async completeOrder(id: string): Promise<void> {
    await db
      .update(orders)
      .set({ 
        status: 'completed', 
        completedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(orders.id, id));
  }

  // Message operations
  async createMessage(message: InsertMessage, senderId: string): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({ ...message, senderId })
      .returning();
    return newMessage;
  }

  async getMessagesByRfq(rfqId: string): Promise<Message[]> {
    const realMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.rfqId, rfqId))
      .orderBy(messages.createdAt);

    // If no real messages exist, return mock messages for demonstration
    if (realMessages.length === 0) {
      const mockMessages: Message[] = [
        {
          id: 'mock-1',
          rfqId,
          senderId: 'supplier-demo-1',
          receiverId: 'buyer-demo-1',
          content: 'Hello! I am interested in your RFQ for industrial equipment. We can provide high-quality machinery from Korea.',
          attachments: null,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: 'mock-2',
          rfqId,
          senderId: 'buyer-demo-1',
          receiverId: 'supplier-demo-1',
          content: 'Thank you for your interest! Could you please send detailed specifications and delivery timeline?',
          attachments: null,
          createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
        },
        {
          id: 'mock-3',
          rfqId,
          senderId: 'supplier-demo-1',
          receiverId: 'buyer-demo-1',
          content: 'Certainly! Our machines meet international standards and we can deliver within 4-6 weeks. I will prepare a detailed quote for you.',
          attachments: null,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        },
        {
          id: 'mock-4',
          rfqId,
          senderId: 'buyer-demo-1',
          receiverId: 'supplier-demo-1',
          content: 'That sounds promising! We are looking for a reliable supplier for long-term partnership.',
          attachments: null,
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        }
      ];
      return mockMessages;
    }

    return realMessages;
  }

  // Rating operations
  async createRating(rating: InsertRating, raterId: string): Promise<Rating> {
    const [newRating] = await db
      .insert(ratings)
      .values({ ...rating, raterId })
      .returning();
    return newRating;
  }

  async getRatingsByUser(userId: string): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.ratedId, userId))
      .orderBy(desc(ratings.createdAt));
  }
}

export const storage = new DatabaseStorage();
