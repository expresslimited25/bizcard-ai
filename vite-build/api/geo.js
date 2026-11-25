// Returns the visitor's country (from Vercel's network) so the site can show RM or $.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ country: req.headers["x-vercel-ip-country"] || null });
}
