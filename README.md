# AI Resume Builder & Analyzer

This app helps users build, analyze, tailor, and export resumes.

The backend has been migrated from Node/Express to Spring Boot for clearer structure and better long-term scalability.

## Product Flow

1. Sign in and save a profile.
2. Build a resume or upload an existing PDF/DOCX.
3. Paste a job description.
4. Get ATS analysis, missing keywords, skill gaps, and AI suggestions.
5. Improve bullets, generate summaries, write cover letters, and export a clean resume.

## Project Structure

```text
src/        React/Vite frontend
backend/   Spring Boot backend
```

## Run Frontend

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api` to Spring Boot on `http://localhost:8080`.
For deployed frontend hosting, set `VITE_API_BASE_URL` to the Spring Boot backend origin.

## Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend configuration is environment-variable driven. Use `.env.example` as the placeholder reference.

## Backend Capabilities

- Supabase signup, login, and token verification
- Profile management
- Resume CRUD with versioned JSON snapshots
- PDF/DOCX resume upload parsing
- Deterministic ATS scoring
- Groq-powered recommendations, job matching, bullet improvements, summaries, and cover letters
- Saved job descriptions
- Health endpoint at `/api/health`

## Database

Run `backend/schema.sql` in Supabase SQL Editor, then configure:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
GROQ_API_KEY
```

Never commit real API keys.
