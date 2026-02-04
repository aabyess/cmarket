import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertRfqSchema, insertQuoteSchema, insertMessageSchema, insertRatingSchema } from "@shared/schema";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Simple Auth routes
  app.post('/api/auth/register', async (req: any, res) => {
    try {
      const { email, password, companyName, companyType, firstName, lastName } = req.body;
      
      if (!email || !password || !companyName || !companyType) {
        return res.status(400).json({ message: "Email, password, company name and company type are required" });
      }

      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [newUser] = await db.insert(users).values({
        email,
        password: hashedPassword,
        companyName,
        companyType,
        firstName: firstName || '',
        lastName: lastName || '',
      }).returning();

      req.session.userId = newUser.id;
      
      res.json({ 
        id: newUser.id,
        email: newUser.email,
        companyName: newUser.companyName,
        companyType: newUser.companyType,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      
      res.json({ 
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        companyType: user.companyType,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post('/api/auth/logout', async (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        companyType: user.companyType,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // RFQ routes
  app.get('/api/rfqs', async (req, res) => {
    try {
      const rfqs = await storage.getRfqs();
      res.json(rfqs);
    } catch (error) {
      console.error("Error fetching RFQs:", error);
      res.status(500).json({ message: "Failed to fetch RFQs" });
    }
  });

  app.get('/api/rfqs/my', async (req: any, res) => {
    try {
      // For demo purposes, return all RFQs
      const rfqs = await storage.getRfqs();
      res.json(rfqs);
    } catch (error) {
      console.error("Error fetching user RFQs:", error);
      res.status(500).json({ message: "Failed to fetch user RFQs" });
    }
  });

  app.post('/api/rfqs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Convert date string to Date object before validation
      const requestBody = {
        ...req.body,
        deadline: req.body.deadline ? new Date(req.body.deadline + 'T23:59:59') : new Date()
      };
      const rfqData = insertRfqSchema.parse(requestBody);
      const rfq = await storage.createRfq(rfqData, userId);
      res.json(rfq);
    } catch (error) {
      console.error("Error creating RFQ:", error);
      res.status(500).json({ message: "Failed to create RFQ" });
    }
  });

  app.get('/api/rfqs/:id', async (req, res) => {
    try {
      const rfq = await storage.getRfq(req.params.id);
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      res.json(rfq);
    } catch (error) {
      console.error("Error fetching RFQ:", error);
      res.status(500).json({ message: "Failed to fetch RFQ" });
    }
  });

  // Quote routes
  app.get('/api/rfqs/:rfqId/quotes', async (req, res) => {
    try {
      const quotes = await storage.getQuotesByRfq(req.params.rfqId);
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.post('/api/rfqs/:rfqId/quotes', isAuthenticated, async (req: any, res) => {
    try {
      const supplierId = req.user.claims.sub;
      const quoteData = insertQuoteSchema.parse({
        ...req.body,
        rfqId: req.params.rfqId
      });
      const quote = await storage.createQuote(quoteData, supplierId);
      res.json(quote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  app.post('/api/quotes/:id/accept', isAuthenticated, async (req: any, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      const rfq = await storage.getRfq(quote.rfqId);
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }

      const buyerId = req.user.claims.sub;
      const platformFeeRate = 0.02; // 2%
      const platformFee = Number(quote.totalAmount) * platformFeeRate;

      const order = await storage.createOrder({
        rfqId: quote.rfqId,
        quoteId: quote.id,
        buyerId,
        supplierId: quote.supplierId,
        totalAmount: quote.totalAmount,
        platformFee: platformFee.toString(),
      });

      await storage.updateQuoteStatus(quote.id, 'accepted');
      await storage.updateRfqStatus(quote.rfqId, 'pending');

      res.json(order);
    } catch (error) {
      console.error("Error accepting quote:", error);
      res.status(500).json({ message: "Failed to accept quote" });
    }
  });

  // Message routes
  app.get('/api/rfqs/:rfqId/messages', async (req, res) => {
    try {
      const messages = await storage.getMessagesByRfq(req.params.rfqId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/rfqs/:rfqId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        rfqId: req.params.rfqId
      });
      const message = await storage.createMessage(messageData, senderId);
      
      // Broadcast message via WebSocket
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            data: message
          }));
        }
      });

      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Order routes
  app.get('/api/orders', async (req: any, res) => {
    try {
      // For demo purposes, return empty orders array
      const orders: any[] = [];
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders/:id/delivered', isAuthenticated, async (req: any, res) => {
    try {
      await storage.markOrderDelivered(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking order delivered:", error);
      res.status(500).json({ message: "Failed to mark order delivered" });
    }
  });

  app.post('/api/orders/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { rating } = req.body;
      const raterId = req.user.claims.sub;
      
      if (rating) {
        const ratingData = insertRatingSchema.parse({
          ...rating,
          orderId: req.params.id
        });
        await storage.createRating(ratingData, raterId);
      }

      await storage.completeOrder(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing order:", error);
      res.status(500).json({ message: "Failed to complete order" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service not available. Please configure Stripe keys." });
      }

      const { orderId } = req.body;
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const totalWithFee = Number(order.totalAmount) + Number(order.platformFee);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalWithFee * 100), // Convert to cents
        currency: "usd",
        metadata: {
          orderId: order.id,
        },
      });

      await storage.updateOrderPaymentIntent(order.id, paymentIntent.id);
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe webhook for payment confirmation
  app.post('/api/stripe-webhook', async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment service not available" });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;
      
      if (orderId) {
        await storage.updateOrderStatus(orderId, 'paid');
      }
    }

    res.json({ received: true });
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
      // Handle incoming WebSocket messages
      try {
        const data = JSON.parse(message.toString());
        
        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
