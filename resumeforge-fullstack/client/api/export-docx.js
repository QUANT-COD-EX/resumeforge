export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  // DOCX generation is supported directly on the client side via the fallback doc blob,
  // or PDF export via window.print()
  return res.status(503).json({ error: 'Use PDF export or client DOC fallback.' });
}
