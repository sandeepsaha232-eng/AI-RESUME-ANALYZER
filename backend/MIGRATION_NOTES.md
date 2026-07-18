# Migration Notes

## Why Spring Boot

Spring Boot is a better fit for a scalable worldwide backend because it gives the project:

- clear controller/service/repository boundaries,
- mature validation and error handling,
- strong PostgreSQL/JPA support,
- predictable deployment as a single service,
- easy health checks and observability through Actuator,
- safer long-term maintainability than scattered Express route files.

## Feature Understanding

The application is not just an ATS checker. It is a resume workflow platform:

- Account/profile management keeps a user's resume portfolio.
- Resume builder supports editing structured sections.
- Upload parser converts old PDF/DOCX resumes into editable JSON.
- ATS analysis explains formatting, keyword, readability, grammar, and completeness gaps.
- Job matching compares a resume against a target job description.
- AI helper rewrites bullets, generates summaries, and writes cover letters.
- Export remains a frontend feature because it renders the final resume visually.

## Groq Integration

All AI calls now go through `GroqClient`, using the OpenAI-compatible endpoint:

```text
POST https://api.groq.com/openai/v1/chat/completions
```

Use `GROQ_API_KEY` and optionally `GROQ_MODEL`.

## Suggested Repo Layout

```text
frontend React/Vite files remain at repo root
backend/                    Spring Boot backend
backend/src/main/java/...   Java source
backend/schema.sql          Supabase/PostgreSQL schema
```

## Frontend Vite Proxy

Change the Vite proxy from the old Express port to Spring Boot:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

## Important Security Cleanup

The original `.env.example` had real-looking API keys. Replace it with placeholders:

```text
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=
GROQ_API_KEY=
```

If those keys were real, rotate them in Supabase and Groq.
