import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Resume ID is required.' });

    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase credentials not configured in Vercel.' });
    }

    // Try resume_shares first, fallback to shared_resumes
    let { data, error } = await supabase
      .from('resume_shares')
      .select('id, resume_data, template_id, created_at, views_count')
      .eq('id', id)
      .single();

    let targetTable = 'resume_shares';

    if (error && error.message?.includes('relation "public.resume_shares" does not exist')) {
      const fallback = await supabase
        .from('shared_resumes')
        .select('id, resume_data, template_id, created_at, views_count')
        .eq('id', id)
        .single();
      data = fallback.data;
      error = fallback.error;
      targetTable = 'shared_resumes';
    }

    if (error || !data) {
      return res.status(404).json({ error: 'Shared resume not found.' });
    }

    // Increment view count asynchronously
    supabase
      .from(targetTable)
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', id)
      .then(() => {});

    return res.json({
      shareId: data.id,
      templateId: data.template_id,
      createdAt: data.created_at,
      viewsCount: (data.views_count || 0) + 1,
      resumeData: typeof data.resume_data === 'string'
        ? JSON.parse(data.resume_data)
        : data.resume_data
    });
  } catch (err) {
    console.error('Load resume handler error:', err);
    return res.status(500).json({ error: 'Failed to load shared resume.' });
  }
}
