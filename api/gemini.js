/**
 * Jem's secure proxy — runs on Vercel (serverless function).
 *
 * This sits between your public jem.html page and Google's Gemini API.
 * Your real Gemini key lives here as a Vercel "Environment Variable"
 * (set in Vercel's dashboard, never in this file, never visible to
 * anyone visiting your page).
 *
 * Setup:
 *   1. In your GitHub repo, create a new file at exactly this path:
 *        api/gemini.js
 *      and paste this whole file in as its content.
 *   2. Go to vercel.com, sign in (you can use your GitHub account),
 *      and import your "jem" repository as a new project.
 *   3. In the Vercel project's Settings > Environment Variables, add:
 *        GEMINI_API_KEY = your real Gemini key
 *   4. Deploy. Vercel gives you a URL like
 *        https://jem-yourname.vercel.app
 *      Your function will be reachable at:
 *        https://jem-yourname.vercel.app/api/gemini
 */

const GEMINI_MODEL = "gemini-flash-latest";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
