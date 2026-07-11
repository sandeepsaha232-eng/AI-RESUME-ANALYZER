import crypto from 'crypto';
import { supabase } from '../../supabaseClient';
import { Resume } from '../../types';

export async function fetchFullResume(resumeId: string, userId: string): Promise<Resume | null> {
  // 1. Fetch main resume row
  const { data: resumeRow, error: resErr } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single();

  if (resErr || !resumeRow) return null;

  // 2. Fetch profile details
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // 3. Fetch experience rows
  const { data: expRows } = await supabase
    .from('experience')
    .select('*')
    .eq('resume_id', resumeId)
    .order('created_at', { ascending: true });

  // 4. Fetch education rows
  const { data: eduRows } = await supabase
    .from('education')
    .select('*')
    .eq('resume_id', resumeId)
    .order('created_at', { ascending: true });

  // 5. Fetch project rows
  const { data: projRows } = await supabase
    .from('projects')
    .select('*')
    .eq('resume_id', resumeId)
    .order('created_at', { ascending: true });

  // 6. Fetch skills
  const { data: skillRows } = await supabase
    .from('skills')
    .select('skill_name')
    .eq('resume_id', resumeId);

  const personalInfo = {
    fullName: profileRow?.full_name || '',
    email: profileRow?.email || '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: ''
  };

  return {
    id: resumeRow.id,
    title: resumeRow.title,
    lastEdited: resumeRow.updated_at,
    atsScore: resumeRow.ats_score,
    summary: resumeRow.summary || '',
    personalInfo,
    experience: (expRows || []).map(row => ({
      id: row.id,
      company: row.company,
      position: row.position,
      location: row.location || '',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      current: row.current || false,
      bullets: row.bullets || []
    })),
    education: (eduRows || []).map(row => ({
      id: row.id,
      institution: row.institution,
      degree: row.degree,
      fieldOfStudy: row.field_of_study || '',
      location: row.location || '',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      current: row.current || false,
      gpa: row.gpa || ''
    })),
    projects: (projRows || []).map(row => ({
      id: row.id,
      name: row.name,
      role: row.role || '',
      url: row.url || '',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      bullets: row.bullets || []
    })),
    skills: (skillRows || []).map(row => row.skill_name),
    certifications: resumeRow.certifications || [],
    languages: resumeRow.languages || []
  };
}

export async function saveFullResume(resume: Resume, userId: string): Promise<string> {
  const isNew = !resume.id || !resume.id.includes('-'); // check if standard uuid, if not generate one
  const resumeId = isNew ? crypto.randomUUID() : resume.id;

  // 1. Upsert resumes main record
  const { error: resErr } = await supabase
    .from('resumes')
    .upsert({
      id: resumeId,
      user_id: userId,
      title: resume.title || 'Untitled Resume',
      summary: resume.summary || '',
      ats_score: resume.atsScore || 0,
      certifications: resume.certifications || [],
      languages: resume.languages || [],
      updated_at: new Date().toISOString()
    });

  if (resErr) throw resErr;

  // 2. Clear old child elements
  await supabase.from('experience').delete().eq('resume_id', resumeId);
  await supabase.from('education').delete().eq('resume_id', resumeId);
  await supabase.from('projects').delete().eq('resume_id', resumeId);
  await supabase.from('skills').delete().eq('resume_id', resumeId);

  // 3. Re-insert Experiences
  if (resume.experience && resume.experience.length > 0) {
    const experiencesToInsert = resume.experience.map(exp => ({
      resume_id: resumeId,
      company: exp.company,
      position: exp.position,
      location: exp.location || '',
      start_date: exp.startDate || '',
      end_date: exp.endDate || '',
      current: exp.current || false,
      bullets: exp.bullets || []
    }));
    const { error: expErr } = await supabase.from('experience').insert(experiencesToInsert);
    if (expErr) throw expErr;
  }

  // 4. Re-insert Education
  if (resume.education && resume.education.length > 0) {
    const educationToInsert = resume.education.map(edu => ({
      resume_id: resumeId,
      institution: edu.institution,
      degree: edu.degree,
      field_of_study: edu.fieldOfStudy || '',
      location: edu.location || '',
      start_date: edu.startDate || '',
      end_date: edu.endDate || '',
      current: edu.current || false,
      gpa: edu.gpa || ''
    }));
    const { error: eduErr } = await supabase.from('education').insert(educationToInsert);
    if (eduErr) throw eduErr;
  }

  // 5. Re-insert Projects
  if (resume.projects && resume.projects.length > 0) {
    const projectsToInsert = resume.projects.map(proj => ({
      resume_id: resumeId,
      name: proj.name,
      role: proj.role || '',
      url: proj.url || '',
      start_date: proj.startDate || '',
      end_date: proj.endDate || '',
      bullets: proj.bullets || []
    }));
    const { error: projErr } = await supabase.from('projects').insert(projectsToInsert);
    if (projErr) throw projErr;
  }

  // 6. Re-insert Skills
  if (resume.skills && resume.skills.length > 0) {
    const skillsToInsert = resume.skills.map(skill => ({
      resume_id: resumeId,
      skill_name: skill
    }));
    const { error: skillErr } = await supabase.from('skills').insert(skillsToInsert);
    if (skillErr) throw skillErr;
  }

  return resumeId;
}
