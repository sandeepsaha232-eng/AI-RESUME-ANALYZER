# AI Resume Builder & Analyzer
## Spring Boot Backend Migration Report

## Application Understanding

This product is a resume workflow platform for students and professionals. From the provided Builders Program notes and screenshots, the expected user journey is:

1. Sign in so profiles and resumes are saved.
2. Build a new resume or upload an old one.
3. Add a target job description.
4. Get AI feedback for ATS quality, missing keywords, and skill gaps.
5. Improve the resume and export a clean final version.

The key features are:

- Resume builder: add, edit, delete, and rearrange structured sections.
- Resume analysis: check ATS structure, formatting, grammar, completeness, and keywords.
- Job match: compare a resume with a job description and show match percentage.
- AI helper: improve summaries, bullets, achievements, and cover letters.
- Export: handled by the React frontend after the backend returns clean resume data.

## What Changed

The backend has been moved from Node/Express/Gemini to a Spring Boot service that uses Groq for AI calls.

Old backend files removed:

- `server.ts`
- `server.js`
- `api/index.js`
- `src/backend/`
- `src/supabaseClient.ts`

Backend-only Node dependencies were removed from `package.json`. The React app remains as the frontend.

## New Backend Structure

```text
backend/
  src/main/java/com/elevateresume/backend/
    ai/        Groq client and AI career features
    analysis/  Deterministic ATS scoring
    auth/      Supabase signup, login, token verification, profiles
    config/    CORS and application configuration
    health/    /api/health
    jobs/      Saved job descriptions
    resume/    Resume CRUD, version snapshots, upload parser
    shared/    Error envelopes and utilities
  schema.sql
```

## Why Spring Boot

Spring Boot gives the project clearer module boundaries and a production-friendly backend style:

- Controllers expose REST endpoints.
- Services contain business logic.
- Repositories isolate database access.
- Central error handling keeps responses consistent.
- Actuator health checks support deployment monitoring.
- PostgreSQL/Supabase compatibility supports scale beyond local storage.

## AI Provider

The backend now uses Groq through `GROQ_API_KEY`.

Environment variables:

```text
GROQ_API_KEY
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

AI-backed features:

- Uploaded resume parsing
- ATS recommendations
- Job-description match analysis
- Resume bullet improvement
- Professional summary generation
- Cover letter generation

## API Compatibility

The Spring backend keeps the existing frontend routes:

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

Run `backend/schema.sql` in Supabase SQL Editor. It creates:

- `profiles`
- `resumes`
- `resume_versions`
- `job_descriptions`
- `analysis_reports`

Resume data is stored as versioned JSON snapshots for readability and flexible frontend compatibility.

## Security Notes

The old `.env.example` contained real-looking API keys. It has been replaced with placeholders. If those keys were active, rotate them in Supabase and Groq.
