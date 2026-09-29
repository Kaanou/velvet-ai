export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.POLLINATIONS_API_KEY;
  if (!key) return res.status(503).json({ error: 'IA non configurée côté serveur' });
  try {
    const { messages, model = 'openai/gpt-5.4-nano', max_tokens = 450 } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'Messages invalides' });
    const upstream = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens })
    });
    const text = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', 'application/json');
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Erreur serveur IA' });
  }
}
