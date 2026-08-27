# JHONNY AI

Full-stack Gemini-powered AI chat application.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL / Neon
- NextAuth.js
- Google Gemini API
- Vercel

## Local setup

1. Install Node.js 18+.
2. Copy `.env.example` to `.env.local`.
3. Put your PostgreSQL connection string in `DATABASE_URL`.
4. Put your Gemini key in `GEMINI_API_KEY`.
5. Install dependencies:

```bash
npm install
```

6. Create the database:

```bash
npx prisma generate
npx prisma db push
```

7. Start:

```bash
npm run dev
```

Open http://localhost:3000.

## Vercel

Set these environment variables in the Vercel project:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GEMINI_API_KEY`
- `GOOGLE_CLIENT_ID` (optional)
- `GOOGLE_CLIENT_SECRET` (optional)

Never commit `.env.local` or a real Gemini API key.

## Project structure

```text
JhonnyAI-FullStack/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── conversations/
│   │   │   └── user/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   └── types/
├── .env.example
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```
