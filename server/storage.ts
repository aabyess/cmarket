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
    if (userId) {
      return await query.where(eq(rfqs.createdBy, userId)).orderBy(desc(rfqs.createdAt));
    }
    return await query.orderBy(desc(rfqs.createdAt));
  }

  async getRfq(id: string): Promise<Rfq | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
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
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.rfqId, rfqId))
      .orderBy(desc(quotes.createdAt));
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
    return await db
      .select()
      .from(messages)
      .where(eq(messages.rfqId, rfqId))
      .orderBy(messages.createdAt);
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
