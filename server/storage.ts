import {
  users,
  rfqs,
  quotes,
  orders,
  messages,
  ratings,
  conversations,
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
  type Conversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, and, like, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User>;
  
  createRfq(rfq: InsertRfq, userId: string): Promise<Rfq>;
  getRfqs(userId?: string): Promise<Rfq[]>;
  getRfq(id: string): Promise<Rfq | undefined>;
  updateRfqStatus(id: string, status: string): Promise<void>;
  
  createQuote(quote: InsertQuote, supplierId: string): Promise<Quote>;
  getQuotesByRfq(rfqId: string): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  updateQuoteStatus(id: string, status: string): Promise<void>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  updateOrderPaymentIntent(id: string, paymentIntentId: string): Promise<void>;
  markOrderDelivered(id: string): Promise<void>;
  completeOrder(id: string): Promise<void>;
  
  createMessage(message: InsertMessage, senderId: string): Promise<Message>;
  getMessagesByRfq(rfqId: string): Promise<Message[]>;
  
  createRating(rating: InsertRating, raterId: string): Promise<Rating>;
  getRatingsByUser(userId: string): Promise<Rating[]>;
  
  // Partner search
  searchCompanies(query?: string, country?: string, category?: string): Promise<User[]>;
  getCompanyWithRatings(id: string): Promise<{ user: User; avgRating: number; ratingCount: number } | undefined>;
  
  // Conversations
  getConversations(userId: string): Promise<any[]>;
  getOrCreateConversation(participant1Id: string, participant2Id: string, rfqId?: string): Promise<Conversation>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createConversationMessage(conversationId: string, senderId: string, receiverId: string, content: string): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
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

  async createRfq(rfq: InsertRfq, userId: string): Promise<Rfq> {
    const [newRfq] = await db
      .insert(rfqs)
      .values({ ...rfq, createdBy: userId })
      .returning();
    return newRfq;
  }

  async getRfqs(userId?: string): Promise<Rfq[]> {
    if (userId) {
      return await db.select().from(rfqs).where(eq(rfqs.createdBy, userId)).orderBy(desc(rfqs.createdAt));
    }
    return await db.select().from(rfqs).orderBy(desc(rfqs.createdAt));
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

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
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
      .where(eq(orders.buyerId, userId))
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

  async searchCompanies(query?: string, country?: string, category?: string): Promise<User[]> {
    let conditions: any[] = [];
    
    if (country && country !== 'all') {
      conditions.push(eq(users.companyType, country));
    }
    
    if (category && category !== 'all') {
      conditions.push(eq(users.companyCategory, category));
    }
    
    if (query) {
      conditions.push(
        or(
          ilike(users.companyName, `%${query}%`),
          ilike(users.companyDescription, `%${query}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      return await db.select().from(users).where(and(...conditions)).orderBy(desc(users.createdAt));
    }
    
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getCompanyWithRatings(id: string): Promise<{ user: User; avgRating: number; ratingCount: number } | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    
    const userRatings = await db.select().from(ratings).where(eq(ratings.ratedId, id));
    const ratingCount = userRatings.length;
    const avgRating = ratingCount > 0 
      ? userRatings.reduce((sum, r) => sum + r.rating, 0) / ratingCount 
      : 0;
    
    return { user, avgRating, ratingCount };
  }

  async getConversations(userId: string): Promise<any[]> {
    const convs = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));
    
    const result = await Promise.all(convs.map(async (conv) => {
      const otherUserId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
      const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
      
      const lastMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      
      const unreadCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conv.id),
            eq(messages.receiverId, userId),
            eq(messages.isRead, false)
          )
        );
      
      return {
        ...conv,
        otherUser,
        lastMessage: lastMessages[0] || null,
        unreadCount: Number(unreadCount[0]?.count || 0),
      };
    }));
    
    return result;
  }

  async getOrCreateConversation(participant1Id: string, participant2Id: string, rfqId?: string): Promise<Conversation> {
    const existing = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.participant1Id, participant1Id),
            eq(conversations.participant2Id, participant2Id)
          ),
          and(
            eq(conversations.participant1Id, participant2Id),
            eq(conversations.participant2Id, participant1Id)
          )
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const [newConv] = await db
      .insert(conversations)
      .values({
        participant1Id,
        participant2Id,
        rfqId,
      })
      .returning();
    
    return newConv;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createConversationMessage(conversationId: string, senderId: string, receiverId: string, content: string): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId,
        receiverId,
        content,
      })
      .returning();
    
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));
    
    return newMessage;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.receiverId, userId)
        )
      );
  }
}

export const storage = new DatabaseStorage();
