# Korea-Indonesia B2B RFQ Platform

## Overview

This is a full-stack B2B Request for Quotation (RFQ) platform designed to facilitate trade between Korean and Egyptian companies. The platform allows businesses to post RFQs, receive quotes from suppliers, negotiate through real-time chat, process secure payments via Stripe, and manage order fulfillment with delivery confirmation and rating systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Authentication**: Replit Auth integration with OpenID Connect for secure user sessions
- **Payment Processing**: Stripe integration for secure payment handling
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with OpenID Connect strategy for Replit Auth
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSocket implementation for live chat functionality
- **Payment Processing**: Stripe webhooks and payment intent handling

### Data Storage
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle with migrations stored in `/migrations` directory
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Session Storage**: PostgreSQL table for session persistence

### Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: Secure HTTP-only cookies with PostgreSQL backing
- **User Types**: Korean and Egyptian company accounts with role-based features
- **Protected Routes**: Middleware-based authentication checks for API endpoints

### External Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Payment Gateway**: Stripe for payment processing and subscription management
- **Authentication**: Replit Auth OpenID Connect provider
- **Email/Notifications**: Integrated through platform messaging system
- **Real-time Communication**: WebSocket server for instant messaging
- **CDN/Assets**: Google Fonts integration for typography
- **Development Tools**: Replit development environment with hot reload