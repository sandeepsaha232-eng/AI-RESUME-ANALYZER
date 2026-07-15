# AI Resume Builder & Recruiter Intelligence Platform
## Architecture, Debugging & Integration Report

This report outlines the nature of the application, addresses the authentication and connection issues in production environments (like Vercel and Cloud Run), and provides complete step-by-step instructions to connect the database, backend, and frontend.

---

### 1. What Kind of Application Is This?

This is a production-grade **AI Resume Builder & Recruiter Intelligence Platform** engineered with a modern full-stack TypeScript architecture:
*   **Frontend**: Built with **React 19**, **Vite**, **Tailwind CSS**, and **Framer Motion**. It provides a highly interactive 3D guide bot (Aladdin Bot) powered by Three.js/WebGL and clean glassmorphic dashboard views for creating, duplicating, analyzing, and tailoring resumes.
*   **Backend**: Built with **Node.js Express** served as an ES Module. It features modular controllers, security middleware, and deep integrations with:
    *   **Google Gemini API (`@google/genai`)**: Used for parsing unstructured uploaded resumes (`.pdf`, `.docx`), generating tailored resume suggestions, improving experience bullet points, writing professional summaries, and running Job Description alignment checks.
    *   **Supabase Database & Auth**: Handles user sessions, registration, profiles, and transactional data (resumes, work history, education records, job descriptions, analysis reports).
*   **Deployment Configuration**: Configured with Vercel Serverless Function rewrites (`vercel.json` routing requests to `/api/index.ts`) for serverless scale and seamless local Vite dev-proxy routing.

---

### 2. Why Vercel / Cloud Run Deployments Show Errors for New Users / Logins

If your cloud-hosted environment (Vercel or Cloud Run) throws a `500 Internal Server Error` or a frontend JSON parsing crash (`SyntaxError: Unexpected token 'A', 'A server e'... is not valid JSON`), it is caused by the following misconfigurations:

#### A. Unconfigured Supabase Environment Keys
By default, the backend checks for `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. If they are empty or set to placeholder/mock values:
1.  The backend client instantiates an **Offline Mock Fallback Proxy**.
2.  If the backend tries to call chained methods on this proxy (e.g., `supabase.from('resumes').delete().eq(...).eq(...)`), the mock client previously suffered from a call chain `TypeError` ("eq is not a function"), causing an unhandled server exception.
3.  *We have fully patched this by building a generic Recursive Proxy in `src/supabaseClient.ts` that safely intercepts all chained database operations and auth methods, resolving them cleanly when awaited instead of crashing the server.*

#### B. Supabase Email Confirmation Restriction
When a user signs up, Supabase by default requires email verification.
1.  The user is successfully created in Supabase's identity manager, and an automated database trigger (`on_auth_user_created`) inserts their profile into the `public.profiles` table.
2.  However, because email verification is required, Supabase does not return an active session token (`data.session === null`).
3.  If the user tries to immediately log in without confirming their email, Supabase blocks authentication, throwing a `LOGIN_FAILED` or `EMAIL_NOT_CONFIRMED` error.
4.  If the automated database trigger was not executed in the SQL Editor beforehand, the `public.profiles` row will not exist, resulting in a `PROFILE_NOT_FOUND` crash when the authenticated client calls `/api/v1/auth/me`.

---

### 3. Step-by-Step Guide: How to Wire and Configure the System

To fully connect your frontend, backend, and Supabase database, follow these steps:

#### STEP 1: Execute the Database Schema in Supabase
1.  Go to your [Supabase Dashboard](https://supabase.com/).
2.  Click on **SQL Editor** in the left sidebar.
3.  Click **New Query**.
4.  Copy and paste the entire schema SQL script (provided in Section 4 below) into the editor.
5.  Click **Run**. This establishes all tables, indexes, Row Level Security (RLS) policies, and the automatic signup trigger.

#### STEP 2: Configure Environment Variables in Vercel
1.  Go to your project dashboard on **Vercel**.
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add the following environment variables exactly as shown:

| Name | Source (Where to copy from) | Description |
| :--- | :--- | :--- |
| **`SUPABASE_URL`** | Supabase Project > **Project Settings** > **API** > Project URL | The base URL of your Supabase project instance. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Supabase Project > **Project Settings** > **API** > `service_role` key | The high-privilege backend key. (Keep secret, do not expose on frontend). |
| **`SUPABASE_PUBLISHABLE_KEY`** | Supabase Project > **Project Settings** > **API** > `anon` / public key | Used by the SDK for authorization headers. |
| **`SUPABASE_SECRET_KEY`** | Supabase Project > **Project Settings** > **API** > `service_role` key | Mirror key to satisfy legacy SDK requirements. |
| **`SUPABASE_JWKS_URL`** | `https://<YOUR-PROJECT-ID>.supabase.co/auth/v1/.well-known/jwks.json` | Used for decoding and validating JWT tokens in backend middleware. |
| **`GEMINI_API_KEY`** | [Google AI Studio](https://aistudio.google.com/) > **Get API key** | Your unique Gemini AI API access token. |
| **`APP_URL`** | Your deployed Vercel domain URL (e.g., `https://your-app.vercel.app`) | Used for self-referential absolute links and callbacks. |

4.  Click **Save** and trigger a **Redeploy** on Vercel to apply the new variables.

#### STEP 3: Disable Email Confirmation for Easy Testing / Prototype Onboarding
1.  In your Supabase Dashboard, go to **Authentication** > **Providers** > **Email**.
2.  Find **Confirm email** and toggle it **OFF**.
3.  Click **Save**.
   *This allows new users to register and immediately sign in automatically without waiting for verification emails.*

---

### 4. Database Schema SQL DDL Script

Run this SQL query in your **Supabase SQL Editor** to establish the tables, relational integrity, indexes, RLS, and triggers:

```sql
-- Enable UUID generation extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    onboarded_target_title TEXT,
    experience_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. RESUMES Table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Resume',
    summary TEXT,
    ats_score INTEGER DEFAULT 0,
    certifications JSONB DEFAULT '[]'::JSONB,
    languages JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own resumes"
    ON public.resumes FOR ALL
    USING (auth.uid() = user_id);

-- 3. EXPERIENCE Table
CREATE TABLE IF NOT EXISTS public.experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT,
    start_date TEXT,
    end_date TEXT,
    current BOOLEAN DEFAULT false,
    bullets TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own experience"
    ON public.experience FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.experience.resume_id
            AND public.resumes.user_id = auth.uid()
        )
    );

-- 4. EDUCATION Table
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    location TEXT,
    start_date TEXT,
    end_date TEXT,
    current BOOLEAN DEFAULT false,
    gpa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own education"
    ON public.education FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.education.resume_id
            AND public.resumes.user_id = auth.uid()
        )
    );

-- 5. PROJECTS Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    url TEXT,
    start_date TEXT,
    end_date TEXT,
    bullets TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
    ON public.projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.projects.resume_id
            AND public.resumes.user_id = auth.uid()
        )
    );

-- 6. SKILLS Table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    skill_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own skills"
    ON public.skills FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.skills.resume_id
            AND public.resumes.user_id = auth.uid()
        )
    );

-- 7. RESUME_VERSIONS Table
CREATE TABLE IF NOT EXISTS public.resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    resume_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own resume versions"
    ON public.resume_versions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.resume_versions.resume_id
            AND public.resumes.user_id = auth.uid()
        )
    );

-- Trigger for automated updated_at timestamp updating
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create update triggers
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_resumes BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_experience BEFORE UPDATE ON public.experience FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_education BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for automated public.profiles creation on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_resume_id ON public.experience(resume_id);
CREATE INDEX IF NOT EXISTS idx_education_resume_id ON public.education(resume_id);
CREATE INDEX IF NOT EXISTS idx_projects_resume_id ON public.projects(resume_id);
CREATE INDEX IF NOT EXISTS idx_skills_resume_id ON public.skills(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);
```

---

### 5. Summary of Bug Fixes & Refactoring Completed

1.  **Chained Method Crash Prevention (Backend Fallback Proxy)**:
    *   File: `src/supabaseClient.ts`
    *   *Issue*: Chained database modifiers like `.delete().eq().eq()` threw a TypeError crash on mock fallback mode.
    *   *Solution*: Redesigned the fallback using a **Recursive Proxy Pattern** that gracefully dynamically accepts any nested method invocation or chained modifier, returning correct dummy arrays or error models upon promise resolution (`then()`).
2.  **Graceful Frontend Parsing Crash Protection (Fetch wrapper)**:
    *   File: `src/utils/apiHelper.ts`
    *   *Issue*: Server errors (500) throwing plain text / HTML content resulted in an unhandled JSON parse crash (`SyntaxError: Unexpected token 'A'`).
    *   *Solution*: Created `safeFetchJson` which queries the `content-type` header. If the response is HTML/text, it parses it cleanly, strips markdown/HTML wrappers, and raises a user-facing error instead of crashing.
3.  **Unified Integration**:
    *   Refactored all frontend fetch endpoints (`Auth`, `ResumeAnalyzer`, `ResumeBuilder`, `JDMatch`, `MarketingLanding`, and primary state coordinator `App.tsx`) to handle networking seamlessly using `safeFetchJson`. This connects the frontend, backend, and Supabase database cleanly and transparently.
