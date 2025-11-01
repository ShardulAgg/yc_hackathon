# Company Information Form - Data Collection Demo

This document shows what data is collected when a user submits company information through the profile page.

## Form Fields

### Required Fields (marked with *)

1. **Company Name** - `name` (string, required)
2. **Description** - `description` (string, required, minimum 1 character)
3. **Website URL** - `websiteUrl` (string, required, must be valid URL)

### Required Fields (continued)

4. **Use Case** - `useCase` (string, required, describes primary use case or industry application)
   - Can be auto-generated using AI (Perplexity) based on website URL
   - Users can manually edit the generated use case

### Optional Fields

5. **Founder Name** - `founderName` (string, optional)
6. **Founder Bio** - `founderBio` (string, optional)
7. **Founder Video URL** - `videoUrl` (string, optional, must be valid URL if provided, YouTube/Vimeo embed URL)

---

## Example Form Submission Data

### Example 1: Complete Submission (All Fields)

```json
{
  "name": "TechFlow AI",
  "description": "Revolutionary AI-powered workflow automation platform that helps teams streamline their processes and boost productivity by 300%. Trusted by 500+ companies worldwide.",
  "websiteUrl": "https://techflow.ai",
  "useCase": "SaaS for workflow automation and team productivity. Ideal for remote teams, agencies, and growing startups looking to streamline operations.",
  "founderName": "Sarah Johnson",
  "founderBio": "Sarah is a serial entrepreneur with 15+ years in tech. Previously co-founded two successful SaaS companies that exited for $50M+. Passionate about AI and automation.",
  "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
}
```

### Example 2: Minimal Submission (Required Fields Only)

```json
{
  "name": "Simple SaaS",
  "description": "A simple tool that solves complex problems.",
  "websiteUrl": "https://simplesaas.com"
}
```

### Example 3: Partial Optional Fields

```json
{
  "name": "CloudSync Pro",
  "description": "Enterprise cloud synchronization solution for distributed teams.",
  "websiteUrl": "https://cloudsync.pro",
  "useCase": "Enterprise cloud storage and file synchronization for remote teams and distributed organizations.",
  "founderName": "Michael Chen",
  "founderBio": "Michael has been building enterprise software for over 20 years."
  // videoUrl is omitted (optional)
}
```

---

## Database Schema (Prisma)

```prisma
model Company {
  id          String   @id @default(cuid())
  userId      String   @unique  // Automatically set from authenticated user
  name        String
  description String
  websiteUrl  String
  useCase     String?  // Optional: primary use case or industry application
  videoUrl    String?
  founderName String?
  founderBio  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Data Validation Rules

### Validation Applied:

1. **Company Name**:
   - Required
   - Minimum 1 character
   - String type

2. **Description**:
   - Required
   - Minimum 1 character
   - String type (supports multi-line text)

3. **Website URL**:
   - Required
   - Must be a valid URL format
   - Example: `https://example.com` or `http://example.com`

4. **Use Case** (Optional):
   - String type (supports multi-line text)
   - Describes the primary use case or industry application
   - Empty strings are converted to `undefined`
   - Example: `"SaaS for e-commerce businesses"`, `"CRM for real estate agents"`, `"Analytics tool for marketing teams"`

5. **Founder Name** (Optional):
   - String type
   - Empty strings are converted to `undefined`

6. **Founder Bio** (Optional):
   - String type (supports multi-line text)
   - Empty strings are converted to `undefined`

7. **Video URL** (Optional):
   - Must be a valid URL if provided
   - Should be embed URL format (YouTube/Vimeo)
   - Empty strings are converted to `undefined`
   - Example: `https://www.youtube.com/embed/VIDEO_ID`

---

## API Request Format

### Create Company Request:
```typescript
POST /api/trpc/company.create

Headers:
  Authorization: Bearer {sessionId}

Body:
{
  "name": "TechFlow AI",
  "description": "AI-powered workflow automation platform...",
  "websiteUrl": "https://techflow.ai",
  "useCase": "SaaS for workflow automation and team productivity...", // optional
  "founderName": "Sarah Johnson", // optional
  "founderBio": "Sarah is a serial entrepreneur...", // optional
  "videoUrl": "https://www.youtube.com/embed/..." // optional
}
```

### Update Company Request:
```typescript
POST /api/trpc/company.update

Headers:
  Authorization: Bearer {sessionId}

Body:
{
  "id": "company_id_here", // required
  "name": "Updated Company Name", // optional
  "description": "Updated description...", // optional
  "websiteUrl": "https://new-url.com", // optional
  "useCase": "Updated use case...", // optional
  "founderName": "Updated Founder Name", // optional
  "founderBio": "Updated bio...", // optional
  "videoUrl": "https://www.youtube.com/embed/..." // optional
}
```

---

## Example Real-World Scenarios

### Scenario 1: SaaS Startup
```json
{
  "name": "NotionAI",
  "description": "AI-powered note-taking and collaboration tool that helps teams organize knowledge and work together seamlessly.",
  "websiteUrl": "https://notionai.com",
  "useCase": "Note-taking and collaboration platform for teams, students, and knowledge workers. Perfect for documentation, project management, and team wikis.",
  "founderName": "Alex Rivera & Jamie Kim",
  "founderBio": "Alex and Jamie met at Y Combinator. Combined 20+ years of experience in productivity software.",
  "videoUrl": "https://www.youtube.com/embed/abc123xyz"
}
```

### Scenario 2: B2B Enterprise Tool
```json
{
  "name": "DataPulse Analytics",
  "description": "Enterprise-grade analytics platform providing real-time insights for data-driven decision making.",
  "websiteUrl": "https://datapulse.io",
  "useCase": "Business analytics and data visualization platform for enterprise companies. Ideal for marketing teams, product managers, and data analysts.",
  "founderName": "Dr. Maria Santos",
  "founderBio": "PhD in Data Science from MIT. Former Google Analytics lead. Built tools used by Fortune 500 companies.",
  "videoUrl": "https://www.youtube.com/embed/xyz789abc"
}
```

### Scenario 3: Minimal Viable Profile
```json
{
  "name": "QuickStart Tools",
  "description": "Simple tools for fast-growing startups.",
  "websiteUrl": "https://quickstart.tools"
  // All optional fields left empty
}
```

---

## Form Flow

1. User navigates to `/profile` page
2. Clicks on "Company Info" tab in left sidebar
3. Fills out the form with company information
4. Clicks "Save Company" or "Update Company" button
5. Form data is validated client-side
6. Data is sent to backend via tRPC mutation
7. Backend validates and sanitizes data (empty strings → undefined)
8. Data is saved to database
9. Success message shown, form data persists in form fields

---

## Notes

- All optional fields can be left empty
- Empty strings in optional fields are automatically converted to `undefined` before saving
- The `userId` is automatically set from the authenticated user session
- The `createdAt` and `updatedAt` timestamps are automatically managed by Prisma
- Video URLs should be embed URLs (not regular YouTube watch URLs)
  - ✅ Correct: `https://www.youtube.com/embed/VIDEO_ID`
  - ❌ Wrong: `https://www.youtube.com/watch?v=VIDEO_ID`

