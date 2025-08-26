# ExpenseTracker Pro

## Overview

ExpenseTracker Pro is a personal expense management application designed for couples with comprehensive tracking and reporting features. The application provides multi-user support, detailed income and expense tracking with two-level expense categorization, comprehensive reporting and analytics, and payment method tracking. It's built as a full-stack web application with a React frontend and Express.js backend, using PostgreSQL for data persistence and Replit authentication for user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for client-side routing, providing a lightweight alternative to React Router
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management, caching, and synchronization
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation and submission
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Session Management**: Express sessions with PostgreSQL storage for persistent user sessions
- **Authentication**: Replit OpenID Connect (OIDC) integration for secure user authentication
- **API Design**: RESTful endpoints with consistent error handling and logging middleware

### Database Design
- **Primary Database**: PostgreSQL with connection pooling via Neon serverless driver
- **Schema Management**: Drizzle migrations for version-controlled database schema changes
- **Data Structure**: Normalized relational design with proper foreign key relationships
  - Users table for authentication data
  - Income/Expense categories with hierarchical structure for expenses (category > subcategory)
  - Transaction tables (income/expenses) with user, category, and payment method associations
  - Session storage table for authentication persistence

### Authentication & Authorization
- **Provider**: Replit OpenID Connect for seamless integration with Replit environment
- **Session Strategy**: Server-side sessions stored in PostgreSQL with configurable TTL
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration
- **User Management**: Automatic user creation and profile synchronization from OIDC claims

### Data Flow & API Structure
- **Income Management**: CRUD operations for income entries with category and payment method associations
- **Expense Management**: CRUD operations for expense entries with two-level categorization
- **Category Management**: Hierarchical category system with income categories and expense categories/subcategories
- **Payment Methods**: Configurable payment method tracking for all transactions
- **Dashboard Analytics**: Aggregated data endpoints for summary statistics and reporting
- **Date Range Filtering**: Flexible date-based querying for reports and analytics

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for database connectivity
- **drizzle-orm**: Type-safe ORM for database operations and query building
- **express**: Web application framework for API endpoints and middleware
- **passport**: Authentication middleware for OIDC integration
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration with Zod schemas
- **@radix-ui/react-***: Accessible UI primitive components
- **wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation and formatting utilities
- **class-variance-authority**: Utility for component variant management

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database schema migration and management tools
- **tsx**: TypeScript execution for development server

### External Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Authentication**: OpenID Connect provider for user authentication
- **Replit Development Environment**: Integrated development and deployment platform