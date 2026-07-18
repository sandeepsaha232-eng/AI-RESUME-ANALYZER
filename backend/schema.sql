-- Spring Boot backend schema for the AI Resume Analyzer application.
-- Target: Supabase PostgreSQL. Run this in the Supabase SQL editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    onboarded_target_title TEXT,
    experience_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS public.resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    resume_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    jd_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.analysis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    overall_score INTEGER NOT NULL DEFAULT 0,
    categories JSONB NOT NULL,
    recommendations JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_resumes ON public.resumes;
CREATE TRIGGER set_updated_at_resumes BEFORE UPDATE ON public.resumes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_job_descriptions ON public.job_descriptions;
CREATE TRIGGER set_updated_at_job_descriptions BEFORE UPDATE ON public.job_descriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_latest ON public.resume_versions(resume_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON public.job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_resume_id ON public.analysis_reports(resume_id);

-- Optional Supabase RLS. Enable these if this database is also queried directly from clients.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own resumes" ON public.resumes;
CREATE POLICY "Users can manage own resumes" ON public.resumes
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own resume versions" ON public.resume_versions;
CREATE POLICY "Users can manage own resume versions" ON public.resume_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.resume_versions.resume_id
            AND public.resumes.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage own job descriptions" ON public.job_descriptions;
CREATE POLICY "Users can manage own job descriptions" ON public.job_descriptions
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own analysis reports" ON public.analysis_reports;
CREATE POLICY "Users can manage own analysis reports" ON public.analysis_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.analysis_reports.resume_id
            AND public.resumes.user_id = auth.uid()
        )
    );
