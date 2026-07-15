export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  photoUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  url: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string; // e.g., Native, Professional, Working
}

export interface Resume {
  id: string;
  title: string;
  lastEdited: string;
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  certifications: Certification[];
  languages: Language[];
  atsScore?: number;
}

export interface CategoryScores {
  formatting: number;
  keywords: number;
  readability: number;
  grammar: number;
  completeness: number;
}

export interface Recommendation {
  id: string;
  category: 'formatting' | 'keywords' | 'readability' | 'grammar' | 'completeness';
  text: string;
  severity: 'high' | 'medium' | 'low';
  section: string; // e.g., 'experience', 'summary'
}

export interface AnalyzerResult {
  atsScore: number;
  categoryScores: CategoryScores;
  missingSections: string[];
  recommendations: Recommendation[];
}

export interface SkillGap {
  skill: string;
  status: 'missing' | 'found';
}

export interface JDMatchResult {
  matchPercentage: number;
  missingKeywords: string[];
  skillGaps: SkillGap[];
  experienceGapNotes: string;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionView?: string;
}

export interface UserSession {
  id: string;
  deviceName: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserSettings {
  theme: 'system' | 'light' | 'dark';
  reduceMotion: boolean;
  notifications: {
    analysisComplete: boolean;
    jdMatchReady: boolean;
    syncStatus: boolean;
    productUpdates: boolean;
  };
}
