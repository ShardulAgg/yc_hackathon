# SaaS Discovery Platform

A modern platform to discover and promote amazing SaaS companies and their founders. Built with the [T3 Stack](https://create.t3.gg) featuring Next.js, tRPC, Prisma, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Secure user accounts with email/password
- 🚀 **Discover Companies**: Browse through innovative SaaS startups
- 👥 **Founder Stories**: Watch founder videos and read their bios
- 📝 **Company Profile**: Manage your company information and posts
- 🎬 **Creators**: Select social media influencers to promote your content
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 🔍 **Search**: Find companies quickly with instant search
- 🌐 **Responsive**: Works perfectly on all devices

## Tech Stack

- [Next.js](https://nextjs.org) - React framework with App Router
- [tRPC](https://trpc.io) - End-to-end typesafe APIs
- [Prisma](https://prisma.io) - Next-generation ORM
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Password hashing
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [TypeScript](https://www.typescriptlang.org) - Type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
# Create the database file
npx prisma generate
npx prisma db push
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
```

For production, replace with your actual database URL (PostgreSQL, MySQL, etc.)

## Usage

### Browse Companies
Visit `/companies` to see all submitted companies with search functionality.

### Sign Up / Login
1. Click "Sign Up" to create an account
2. Fill in your name, email, and password
3. After signing up, you'll be automatically logged in

### Manage Your Company Profile
Once logged in, visit `/profile` to:
- **Company Info Tab**: Add or update your company information
  - Company name and description
  - Website URL
  - Logo URL (optional)
  - Founder information (optional)
  - Founder video URL (optional) - Use YouTube/Vimeo embed URLs
  
- **Posts Tab**: Create and manage posts for your company
  - Create new posts with title and description
  - View all your company's posts
  
- **Creators Tab**: Browse and explore social media influencers
  - Browse available creators across platforms (YouTube, Instagram, TikTok, LinkedIn)
  - View follower counts and bios
  - Click on a creator to see demo content they could produce for your company
  - View sample videos and images as placeholders

### View Company Details
Click on any company in `/companies` to see full details including founder video if available.

## Database Schema

The platform uses a relational database with the following models:

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  password  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  company   Company?
  sessions  Session[]
  posts     Post[]
}

model Company {
  id          String   @id @default(cuid())
  userId      String   @unique
  name        String
  description String
  websiteUrl  String
  logoUrl     String?
  videoUrl    String?
  founderName String?
  founderBio  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user  User   @relation(fields: [userId], references: [id])
  posts Post[]
}

model Post {
  id          String    @id @default(cuid())
  userId      String
  companyId   String
  title       String
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  user        User      @relation(fields: [userId], references: [id])
  company     Company   @relation(fields: [companyId], references: [id])
  images      PostImage[]
  videos      PostVideo[]
}
```

## API Routes

The app uses tRPC for type-safe API routes:

### Authentication
- `auth.signup` - Create a new user account
- `auth.login` - Log in with email and password
- `auth.logout` - Log out current user
- `auth.me` - Get current user information

### Companies
- `company.getAll` - Get all companies (public)
- `company.getById` - Get company by ID (public)
- `company.getByUserId` - Get current user's company (protected)
- `company.create` - Create a new company (protected)
- `company.update` - Update a company (protected)
- `company.delete` - Delete a company (protected)

### Posts
- `post.getByUserId` - Get posts for current user (protected)
- `post.getByCompanyId` - Get posts for a company (public)
- `post.create` - Create a new post (protected)
- `post.delete` - Delete a post (protected)

### Creators
- `creator.getAll` - Get all creators (public)
- `creator.getById` - Get creator by ID (public)
- `creator.create` - Create a new creator (public)
- `creator.update` - Update a creator (public)
- `creator.delete` - Delete a creator (public)

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/saas-discovery)

Don't forget to set your `DATABASE_URL` environment variable in production!

## Learn More

- [T3 Stack Documentation](https://create.t3.gg)
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Prisma Documentation](https://www.prisma.io/docs)

## License

MIT
