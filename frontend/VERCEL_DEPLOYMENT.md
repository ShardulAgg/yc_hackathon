# Vercel Deployment Guide

This guide will help you deploy your SaaS Discovery Platform to Vercel.

## ⚠️ Important: Database Setup

**SQLite will NOT work on Vercel** because Vercel uses serverless functions with ephemeral filesystems. You need to switch to a cloud database.

### Recommended Databases:
1. **PostgreSQL (Recommended)** - Use Vercel Postgres, Neon, or Supabase
2. **MySQL** - Use PlanetScale or Railway
3. **MongoDB** - Use MongoDB Atlas

## Step-by-Step Deployment

### Option 1: Quick Deploy with Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts. When asked:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No** (for first deploy)
   - Project name? (Press enter for default or type a name)
   - Directory? **./** (current directory)
   - Override settings? **No**

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**:
   - Visit [https://vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Set root directory to: `frontend`

3. **Configure Project Settings**:
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
   - Build Command: `npm run build` (or leave default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

## Environment Variables Setup

**IMPORTANT**: You must set these environment variables in Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add the following:

### Required Variables:

```env
DATABASE_URL="your-postgresql-connection-string"
# Example: postgresql://user:password@host:5432/database

NODE_ENV="production"
```

### Optional Variables:

```env
PERPLEXITY_API_KEY="your-perplexity-api-key"
# Only needed if you want AI auto-generation features
```

### Getting a PostgreSQL Database:

#### Option A: Vercel Postgres (Easiest)
1. In your Vercel project, go to Storage tab
2. Create a new Postgres database
3. Vercel will automatically set `POSTGRES_URL` environment variable
4. Update your `DATABASE_URL` to use `POSTGRES_URL`

#### Option B: Neon (Free tier available)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use it as `DATABASE_URL` in Vercel

#### Option C: Supabase (Free tier available)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Use it as `DATABASE_URL` in Vercel

## Update Prisma for PostgreSQL

Once you have a PostgreSQL database:

1. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update environment variable in Vercel**:
   - Set `DATABASE_URL` to your PostgreSQL connection string

3. **Run migrations locally first** (optional but recommended):
   ```bash
   cd frontend
   npm run db:push
   ```

4. **Vercel will automatically run `prisma generate` during build** (thanks to `postinstall` script)

## Build Settings

Vercel should auto-detect Next.js, but verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (or `cd frontend && npm run build` if deploying from root)
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Post-Deployment Checklist

1. ✅ Environment variables are set
2. ✅ Database is connected and migrated
3. ✅ Test the live site:
   - Visit your Vercel URL
   - Try creating an account
   - Create a company profile
   - Test the auto-generate features (if PERPLEXITY_API_KEY is set)

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Ensure all environment variables are set
- Verify `DATABASE_URL` is correct

### Database Connection Errors
- Verify `DATABASE_URL` is correctly formatted
- Check if your database allows connections from Vercel IPs
- For Neon/Supabase, ensure connection pooling is configured if needed

### Prisma Errors
- Make sure `DATABASE_URL` is set
- Check that Prisma schema matches your database
- Try running `npx prisma generate` locally first

### Environment Variables Not Working
- Make sure variables are set for the correct environment (Production, Preview, Development)
- Redeploy after adding new environment variables

## Custom Domain (Optional)

1. Go to your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Monitoring

- Check Vercel Analytics in the dashboard
- Monitor function logs for errors
- Set up alerts for failed deployments

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma with Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

