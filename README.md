# Hayde - Wedding Planning & Expense Management

A full-stack web application for comprehensive wedding planning, featuring expense tracking, guest management with RSVP functionality, and bulk import capabilities. Built as both a practical tool for a June 2026 wedding and a portfolio showcase of modern full-stack development practices.

## Features

### Implemented
- **Expense Management**: Track expenses by category with payment progress monitoring
- **Guest List Management**: Comprehensive guest tracking with RSVP status and party size
- **Guest Grouping**: Organize guests into logical groups for better management
- **Dashboard Analytics**: Real-time statistics, totals, and visual insights
- **Excel Import**: Bulk guest import from Excel files with preview and validation
- **RSVP Tracking**: Monitor invitation and reminder timestamps
- **Statistics API**: Aggregated metrics for guests and expenses

### Planned Features
- **WhatsApp Integration**: Automated invitation sending and guest import via messaging APIs
- **Seating Arrangements**: Visual seating chart with drag-and-drop table assignments
- **AI Chatbot**: Query assistant for wedding data insights

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **TypeScript** - Type-safe development
- **Prisma ORM** - Type-safe database queries and migrations
- **PostgreSQL** - Relational database
- **Zod** - Runtime validation and type inference
- **xlsx** - Excel file parsing for bulk imports

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe components
- **Vite** - Fast build tool and dev server
- **React Router v7** - Client-side routing
- **TailwindCSS** - Utility-first styling
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - User notifications
- **Lucide React** - Icon library

## Prerequisites

- **Node.js** 16+ and npm
- **PostgreSQL** 12+ running on `localhost:5432`
- Git

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Hayde
```

### 2. Database Setup
Ensure PostgreSQL is running and create a database:
```sql
CREATE DATABASE hayde;
```

### 3. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/hayde\"" > .env

# Generate Prisma Client and run migrations
npx prisma generate
npm run migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Application runs on `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Project Structure

```
Hayde/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Migration history
│   └── src/
│       ├── config/                # Prisma client singleton
│       ├── controllers/           # Request handlers
│       ├── errors/                # Custom error classes
│       ├── middleware/            # Validation & error handling
│       ├── routes/                # API route definitions
│       ├── types/                 # TypeScript interfaces
│       ├── utils/                 # Transformers & helpers
│       ├── validators/            # Zod schemas
│       └── server.ts              # Express app entry
│
├── frontend/
│   └── src/
│       ├── components/            # Feature-based components
│       │   ├── categories/
│       │   ├── common/
│       │   ├── dashboard/
│       │   ├── expenses/
│       │   ├── groups/
│       │   └── guests/
│       ├── pages/                 # Route pages
│       ├── services/              # API client
│       ├── types/                 # TypeScript types & DTOs
│       └── utils/                 # Validation & helpers
│
└── README.md
```

## API Documentation

### Base URL
`http://localhost:3000/api`

### Endpoints

#### Categories
- `GET /categories` - Get all categories with expense totals
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category (fails if has expenses)

#### Expenses
- `GET /expenses` - Get all expenses
- `GET /expenses/category/:categoryId` - Get expenses by category
- `GET /expenses/totals` - Get total expenses and remaining amounts
- `POST /expenses` - Create new expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

#### Guests
- `GET /guests` - Get all guests
- `GET /guests/group/:groupId` - Get guests by group
- `GET /guests/stats` - Get guest statistics (totals, RSVP breakdown)
- `POST /guests` - Create new guest
- `PUT /guests/:id` - Update guest
- `PATCH /guests/:id/rsvp` - Update RSVP status
- `DELETE /guests/:id` - Delete guest

#### Groups
- `GET /groups` - Get all groups
- `POST /groups` - Create new group
- `PUT /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group (fails if has guests)

#### Import
- `POST /import/preview` - Preview Excel import with validation
- `POST /import/confirm` - Execute bulk guest import

#### Health
- `GET /health` - Database connection health check

## Architecture Highlights

### Backend Patterns

**1. Prisma ORM Integration**
- Type-safe database queries with auto-generated TypeScript types
- Schema-first approach with migrations
- Connection pooling and query optimization built-in

**2. Error Handling**
- Custom error hierarchy (ValidationError, NotFoundError, ConflictError, DatabaseError)
- Centralized error handler middleware
- Prisma error mapping (P2002 → ConflictError, P2025 → NotFoundError)
- Consistent JSON error responses with proper HTTP status codes

**3. Validation Pipeline**
- Zod schemas for runtime type validation
- Validation middleware applied before controller execution
- Type inference from Zod schemas
- Field-level error messages

**4. Data Transformation**
- Transformer utilities convert Prisma models to API responses
- Database `snake_case` ↔ API `snake_case` consistency
- Prisma `Decimal` → JavaScript `number` conversion
- Calculated fields (total_cost, remaining_amount) computed on-the-fly

**5. Request Flow**
```
HTTP Request
  → Route Definition
  → Validation Middleware (Zod)
  → asyncHandler Wrapper
  → Controller Function
  → Prisma ORM Query
  → Transform Response
  → JSON Response
```

### Frontend Patterns

**1. Centralized API Client**
- Axios instance with base URL configuration
- Response interceptors for global error handling
- Type-safe API methods organized by entity

**2. Error Handling**
- Axios interceptors map errors to user-friendly Hebrew messages
- React Hot Toast for non-intrusive notifications
- Error Boundary for React component errors

**3. Component Architecture**
- Feature-based organization
- Reusable components in `common/`
- Type-safe props with TypeScript interfaces

**4. Validation**
- Frontend Zod schemas mirror backend validation
- Ready for react-hook-form integration

## Database Schema

### Core Entities

**Categories** (1:N with Expenses)
- id, name, created_at

**Expenses**
- id, name, price_per_unit, quantity, amount_paid, category_id, created_at
- Calculated: total_cost, remaining_amount

**Groups** (1:N with Guests)
- id, name, description, created_at

**Guests**
- id, name, phone_number, number_of_guests, rsvp_status, notes, group_id
- invitation_sent_at, reminder_sent_at, created_at

## Development Commands

### Backend
```bash
npm run dev              # Development server with hot reload
npm start                # Production server
npm run migrate          # Run Prisma migrations
npm run prisma:generate  # Generate Prisma Client
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:push      # Push schema changes (dev only)
```

### Frontend
```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Excel Import Format

The Excel import feature expects the following column structure:

| Column | Description | Format |
|--------|-------------|--------|
| A | Group Name | Text |
| B | Guest Name | Text |
| C | Phone Number | Israeli format (05X-XXX-XXXX) |
| D | Number of Guests | Integer (1-20) |

**Features:**
- Preview with validation before import
- Duplicate detection by phone number
- Error reporting per row
- Option to replace or skip duplicates

## Contributing

This is a personal project, but feedback and suggestions are welcome.

## License

Private project - All rights reserved

---

**Built with ❤️ for a June 2026 wedding**
