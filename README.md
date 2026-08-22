<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Campus-Ai

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b8873a46-cc52-4a9a-97c5-8dccc23a912f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env` file with:
   `GEMINI_API_KEY=your_gemini_api_key`
   `DATABASE_URL=your_postgres_connection_string`
   `VITE_API_URL=http://localhost:3000`
   `AUTH_SECRET=long_random_server_secret`
   `DEMO_MODE=false`
3. Run the app:
   `npm run dev`

## Deployment

Deploy the frontend to Vercel with this environment variable:

`VITE_API_URL=https://YOUR-RENDER-BACKEND-URL`

Deploy the Express backend to Render with:

- Build Command: `npm install && npm run build`
- Start Command: `npx tsx server.ts`

Configure these Render environment variables:

- `GEMINI_API_KEY`: server-side Gemini API key
- `DATABASE_URL`: PostgreSQL or Supabase connection string. The server creates its tables and imports the existing demo complaints on first startup.
- `AUTH_SECRET`: server-only signing secret for authentication tokens.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: server-only credentials for `POST /api/auth/staff-login`.
- `WARDEN_EMAIL` / `WARDEN_PASSWORD`: server-only credentials for warden sessions.
- `FRONTEND_URL`: the production Vercel URL

The backend health check is available at `/api/health`.

Official ITS information endpoints:

- `/api/college/courses`
- `/api/college/departments`
- `/api/college/directory`

These endpoints use the official ITS Engineering College home, directory, and course pages as their sources. BCA and BBA are selectable application options but remain explicitly unverified because they are not listed on the verified Course Offered page. Official warden contact information is also reported as unavailable because it is not published in the verified directory source.

The Render build command remains `npm install && npm run build` and the start command remains `npx tsx server.ts`.

When `DATABASE_URL` is omitted, local development uses the existing in-process compatibility cache; configure PostgreSQL for persistence across restarts and instances.

Render also supports the equivalent Bun commands: `bun install && bun run build` and `bun run start`.
