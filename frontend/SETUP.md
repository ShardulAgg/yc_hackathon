# Quick Setup Guide

## Prerequisites

Make sure you have Node.js 18+ installed on your system.

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. **Create `.env` file:**
   Create a `.env` file in the root directory with:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Troubleshooting

### Database issues
If you encounter database errors:
```bash
# Regenerate Prisma client
npm run db:generate

# Reset the database (⚠️ deletes all data)
rm dev.db
npm run db:push
```

### Port already in use
If port 3000 is busy, Next.js will automatically use the next available port.

## Next Steps

1. Visit the home page to see the landing page
2. Try submitting a company at `/submit`
3. Browse companies at `/companies`
4. Customize the design and add more features!

