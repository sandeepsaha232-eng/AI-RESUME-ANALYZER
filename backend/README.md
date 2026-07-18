# AI Resume Analyzer Spring Boot Backend

This folder is the clean Spring Boot replacement for the old Node/Express backend.

## What The App Does

The product journey from the provided notes/screenshots is:

1. Sign in and keep a user profile.
2. Build, save, duplicate, update, and delete resumes.
3. Upload an old resume and parse it into structured sections.
4. Analyze ATS quality: formatting, keywords, readability, grammar, and completeness.
5. Paste a job description and get match percentage, missing keywords, and skill gaps.
6. Use AI to improve bullets, generate summaries, and write cover letters.
7. Export a clean final resume from the frontend.

## Backend Modules

- `auth`: Supabase signup, login, token verification, and profile records.
- `resume`: resume CRUD, upload text extraction, versioned resume snapshots.
- `analysis`: deterministic ATS scoring.
- `ai`: Groq OpenAI-compatible chat calls and AI career prompts.
- `jobs`: saved job descriptions for reusable role targeting.
- `health`: `/api/health` readiness status.
- `shared`: error envelope and small utilities.

## Required Environment

```bash
DATABASE_URL=jdbc:postgresql://<host>:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<password>
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
GROQ_API_KEY=<groq-api-key>
GROQ_MODEL=llama-3.3-70b-versatile
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

Do not commit real API keys. Keep `.env.example` as placeholders only.

## Run

```bash
mvn spring-boot:run
```

The API defaults to port `8080`.

In the React Vite app, proxy `/api` to `http://localhost:8080`.

## Old Backend Files To Remove From The React Repo

Delete these Node/Express backend files after copying this folder into the app:

```text
server.ts
server.js
api/index.js
src/backend/
src/supabaseClient.ts
```

Remove backend-only Node dependencies:

```text
@google/genai
@supabase/server
@supabase/supabase-js
express
cors
dotenv
multer
pdf-parse
mammoth
tsx
esbuild
@types/express
@types/cors
@types/multer
```

Keep frontend dependencies such as React, Vite, Tailwind, Three, and Lucide.

## Frontend API Compatibility

The Spring backend keeps the existing route contracts:

```text
GET    /api/health
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
GET    /api/v1/auth/me
PUT    /api/v1/auth/profile
GET    /api/v1/resumes
GET    /api/v1/resumes/{id}
POST   /api/v1/resumes
PUT    /api/v1/resumes/{id}
DELETE /api/v1/resumes/{id}
POST   /api/v1/resumes/upload
POST   /api/v1/analyze
POST   /api/v1/compare
POST   /api/v1/improve
POST   /api/v1/generate-summary
POST   /api/v1/generate-cover-letter
GET    /api/v1/job-descriptions
POST   /api/v1/job-descriptions
```

## Database

Run `schema.sql` in Supabase SQL Editor. The backend stores:

- Profiles
- Resume metadata
- Versioned full-resume JSON snapshots
- Job descriptions
- Optional analysis report history

This is intentionally simpler than the old split controller/repository backend and easier for students/reviewers to understand.
