# Nike E-commerce App

A modern e-commerce application built with Next.js, TypeScript, TailwindCSS, Better Auth, Neon PostgreSQL, Drizzle ORM, and Zustand.

## Features

- 🛍️ Product catalog with Nike items
- 🔐 Authentication with Better Auth
- 🗄️ PostgreSQL database with Neon
- 🔄 Type-safe database operations with Drizzle ORM
- 🎨 Beautiful UI with TailwindCSS
- 📱 Responsive design
- ⚡ State management with Zustand

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **State Management**: Zustand
- **Linting**: ESLint

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Neon PostgreSQL database
- (Optional) GitHub OAuth app for social login

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your database URL and other required variables.

4. Generate and push database schema:
   ```bash
   npm run db:push
   ```

5. Seed the database with Nike products:
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The app includes a `products` table with the following fields:
- `id`: Primary key
- `name`: Product name
- `description`: Product description
- `price`: Product price (decimal)
- `imageUrl`: Product image URL
- `category`: Product category
- `brand`: Product brand
- `stock`: Available stock
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/route.ts    # Better Auth API routes
│   │   └── products/route.ts         # Products API
│   └── page.tsx                      # Homepage
├── lib/
│   ├── db/
│   │   ├── index.ts                  # Database connection
│   │   └── schema.ts                 # Database schema
│   ├── store/
│   │   └── products.ts               # Zustand store
│   └── auth.ts                       # Better Auth configuration
└── scripts/
    └── seed.ts                       # Database seeding script
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
DATABASE_URL="your-neon-database-url"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID="your-github-client-id" # Optional
GITHUB_CLIENT_SECRET="your-github-client-secret" # Optional
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request