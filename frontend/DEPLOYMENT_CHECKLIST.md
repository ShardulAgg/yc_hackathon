# Vercel Deployment Checklist

## 🚨 CRITICAL: Database Migration Required

**SQLite will NOT work on Vercel!** You must switch to PostgreSQL before deploying.

---

## Quick Deployment Steps

### 1. Get a PostgreSQL Database (Choose One)

**Option A: Vercel Postgres (Easiest)**
- After creating project on Vercel, go to Storage tab
- Create Postgres database
- Vercel auto-sets `POSTGRES_URL` env var

**Option B: Neon (Recommended - Free tier)**
1. Go to https://neon.tech
2. Sign up and create project
3. Copy connection string

**Option C: Supabase (Free tier)**
1. Go to https://supabase.com  
2. Create project
3. Copy connection string from Settings → Database

---

### 2. Update Prisma Schema

**Change in `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"  // ← Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

**Then run locally:**
```bash
cd frontend
npm run db:push
```

---

### 3. Deploy to Vercel

**Method A: Via Vercel Dashboard**
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Add New Project"
4. Import your repo
5. Set **Root Directory**: `frontend`
6. Click Deploy

**Method B: Via CLI**
```bash
cd frontend
npm i -g vercel
vercel login
vercel
vercel --prod  # for production
```

---

### 4. Set Environment Variables in Vercel

Go to: **Project → Settings → Environment Variables**

Add these:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NODE_ENV=production
PERPLEXITY_API_KEY=your-key-here  # Optional
```

**Important:**
- Use the PostgreSQL connection string from step 1
- Make sure to add for **Production**, **Preview**, and **Development** environments
- Click "Save" after adding each variable

---

### 5. Redeploy After Setting Variables

- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

---

### 6. Test Your Live Site

- Visit your Vercel URL
- Create an account
- Try creating a company profile
- Test auto-generate features

---

## Troubleshooting

**Build fails?**
- Check build logs in Vercel
- Ensure `DATABASE_URL` is set correctly
- Verify Prisma schema is updated to PostgreSQL

**Database connection errors?**
- Double-check connection string format
- Ensure database allows Vercel IP connections
- For Neon/Supabase: Check connection pooling settings

**Missing environment variables?**
- Make sure vars are added for all environments
- Redeploy after adding variables

---

## Success Criteria

✅ Build completes without errors  
✅ Site loads at Vercel URL  
✅ Can create account and login  
✅ Can create company profile  
✅ Database persists data correctly  

---

## Need Help?

📖 Full guide: See `VERCEL_DEPLOYMENT.md`  
🌐 Vercel Docs: https://vercel.com/docs  
💬 Vercel Support: Available in dashboard  

