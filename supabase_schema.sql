-- Supabase Schema for AI Resume Builder & Recruiter Intelligence Platform
-- Target: PostgreSQL / Supabase SQL Editor

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

-- 8. JOB_DESCRIPTIONS Table
CREATE TABLE IF NOT EXISTS public.job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    jd_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own job descriptions"
    ON public.job_descriptions FOR ALL
    USING (auth.uid() = user_id);

-- 9. ANALYSIS_REPORTS Table
CREATE TABLE IF NOT EXISTS public.analysis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    overall_score INTEGER NOT NULL DEFAULT 0,
    categories JSONB NOT NULL, -- { formatting: X, keywords: Y, readability: Z, grammar: W, completeness: V }
    recommendations JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own analysis reports"
    ON public.analysis_reports FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.analysis_reports.resume_id
            AND public.resumes.user_id = auth.uid()
        )
    );

-- 10. ATS_SCORES Table
CREATE TABLE IF NOT EXISTS public.ats_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ats_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ats scores"
    ON public.ats_scores FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.ats_scores.resume_id
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
CREATE TRIGGER set_updated_at_job_descriptions BEFORE UPDATE ON public.job_descriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

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
CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON public.job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_resume_id ON public.analysis_reports(resume_id);
CREATE INDEX IF NOT EXISTS idx_ats_scores_resume_id ON public.ats_scores(resume_id);

-- Storage bucket creation configuration script recommendation
-- Standard 'resume-files' bucket RLS policy scripts:
-- To create the bucket, execute in dashboard/functions or use Supabase interface:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resume-files', 'resume-files', false);
--
-- CREATE POLICY "Users can upload their own resume files" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'resume-files' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can read their own resume files" ON storage.objects
--   FOR SELECT USING (bucket_id = 'resume-files' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can delete their own resume files" ON storage.objects
--   FOR DELETE USING (bucket_id = 'resume-files' AND auth.uid()::text = (storage.foldername(name))[1]);
