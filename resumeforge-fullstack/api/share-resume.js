import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { resumeData } = req.body;
    if (!resumeData || typeof resumeData !== 'object') {
      return res.status(400).json({ error: 'Valid resumeData object is required.' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel.' });
    }

    const shareId = `rf_${nanoid(8)}`;
    const templateId = resumeData?.meta?.template || 'modern';

    // Try resume_shares first (as in user's Supabase dashboard), fallback to shared_resumes
    let { error } = await supabase
      .from('resume_shares')
      .insert({
        id: shareId,
        resume_data: resumeData,
        template_id: templateId,
        views_count: 0
      });

    if (error && error.message?.includes('relation "public.resume_shares" does not exist')) {
      const fallback = await supabase
        .from('shared_resumes')
        .insert({
          id: shareId,
          resume_data: resumeData,
          template_id: templateId,
          views_count: 0
        });
      error = fallback.error;
    }

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    const clientOrigin = process.env.CLIENT_ORIGIN || 'https://resumeforge.vercel.app';
    return res.status(201).json({
      shareId,
      shareUrl: `${clientOrigin}/?share=${shareId}`
    });
  } catch (err) {
    console.error('Share resume handler error:', err);
    return res.status(500).json({ error: 'Failed to save shared resume.' });
  }
}
