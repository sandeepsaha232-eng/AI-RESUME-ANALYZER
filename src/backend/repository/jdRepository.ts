import { supabase } from '../../supabaseClient';

export async function fetchJobDescriptions(userId: string) {
  const { data, error } = await supabase
    .from('job_descriptions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveJobDescription(userId: string, title: string, company: string, jdText: string) {
  const { data, error } = await supabase
    .from('job_descriptions')
    .insert({
      user_id: userId,
      title: title || 'Target Role',
      company: company || '',
      jd_text: jdText
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
