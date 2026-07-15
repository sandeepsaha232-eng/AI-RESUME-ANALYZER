# Elevate Resume & Recruiter Intelligence Platform

An ultra-premium, production-grade SaaS workspace engineered to help modern professionals build, analyze, and optimize resumes with deterministic recruiter logic and state-of-the-art AI-driven tailoring.

---

## 💎 Core Mission & Philosophy

*   **recruiter-designed heuristics**: High-end recruitment parsers do not evaluate visual charts, colorful graphs, or stars. Elevate enforces strict scannable criteria, zero-column layouts, and optimal font-rendering weights.
*   **AI as an Assistant, Not the Architect**: Business rules determine structural ratings and match gaps, while Gemini API provides context-aware prose refinement without generating hallucinations.
*   **Ultra-Premium Visual Language**: Devoid of gimmicky neon trends, the application leverages matte metallic accents, clean slate charcoal palettes, subtle glassmorphic container boundaries, and physics-driven micro-interactions.

---

## ✨ Features

1.  **🤖 Advanced Interactive Workspace**
    *   Construct section-by-section details across education, projects, languages, and custom achievements.
    *   Real-time structural parsing validation checks for field completeness and phone coordinate formats.

2.  **📄 Deterministic Resume Analyzer**
    *   Frictionless resume dropzone parsing formats (PDF, DOCX, and raw images).
    *   Instant scannability score computation utilizing standard ATS rules.

3.  **🎯 Job Description Matcher**
    *   Input target JDs to compute a comprehensive skills-gap report.
    *   Highlights missing technical terminology, required keywords, and experience metrics.

4.  **✨ Professional-Grade Bullet Point Calibration**
    *   Transform generic task descriptions into results-focused accomplishments utilizing strong action verbs and quantified impact metrics.

5.  **📝 Automated Summary Builder**
    *   Generates punchy, executive-level summaries based on candidate roles and target coordinates.

---

## 🛠️ Tech Stack & Architecture

*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide icons, Framer Motion (`motion/react`).
*   **Aesthetic Mesh Canvas**: Pure-CSS hardware-accelerated floating micro-elements rendering slate-platinum highlights (`CanvasVisualizer.tsx`).
*   **Local Persistence**: Automated LocalStorage caching for full offline-first functionality and instant backup.
*   **Database Synchronization fallback**: Supabase secure authentication (`@supabase/supabase-js`, `@supabase/server`).

---

## 🚀 How to Run Locally

### Prerequisites
*   Node.js (v20+ recommended)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Google Gemini API Credentials
GEMINI_API_KEY=your_gemini_api_key

# Supabase Secure Accounts Setup
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Step 3: Run the Application
To run the full-stack system in development mode:

*   **Frontend Server (Port 3000)**:
    ```bash
    npm run dev
    ```
*   **Express Backend Server (Port 3001)**:
    ```bash
    npm run dev:server
    ```

---

## 📦 Production Bundling & Deployment

Compile static web assets and compile the Express server into a standalone ES Module:
```bash
npm run build
```
This runs the frontend compilation and bundles `server.ts` utilizing `esbuild` with blank mocks aliased for headless canvas requirements.
