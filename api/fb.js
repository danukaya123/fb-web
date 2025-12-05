// /api/fb.js
const getFbVideoInfo = require("@xaviabot/fb-downloader");
const he = require("he");

module.exports = async (req, res) => {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const q = (req.query.q || req.body?.q || "").toString().trim();
    if (!q) return res.status(400).json({ ok: false, message: "Missing `q` param" });

    // Validate FB URL
    const fbRegex = /(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/;
    if (!fbRegex.test(q)) return res.status(400).json({ ok: false, message: "Invalid Facebook URL" });

    // Fetch video info
    const result = await getFbVideoInfo(q);
    if (!result || (!result.sd && !result.hd))
      return res.status(500).json({ ok: false, message: "Failed to fetch video" });

    const { title, sd, hd, thumbnail } = result;
    const safeTitle = he.decode(title || "Unknown").normalize("NFC");

    return res.json({
      ok: true,
      title: safeTitle,
      urls: { sd, hd },
      thumbnail,
    });
  } catch (err) {
    console.error("❌ FB API error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
};
