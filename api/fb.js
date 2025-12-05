const getFbVideoInfo = require("@xaviabot/fb-downloader");
const he = require("he");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.status(400).json({ ok: false, message: "Missing `q` parameter" });

    // Validate Facebook URL
    const fbRegex = /(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/;
    if (!fbRegex.test(q)) {
      return res.status(400).json({ ok: false, message: "Invalid Facebook URL" });
    }

    const result = await getFbVideoInfo(q);
    if (!result || (!result.sd && !result.hd)) {
      return res.status(404).json({ ok: false, message: "Video not found or private" });
    }

    const title = he.decode(result.title || "Facebook Video").normalize("NFC");
    const thumbnail = result.thumbnail || null;
    const urls = {
      hd: result.hd || null,
      sd: result.sd || null,
    };

    return res.json({ ok: true, title, thumbnail, urls });
  } catch (err) {
    console.error("FB API error:", err);
    return res.status(500).json({ ok: false, message: "Failed to fetch video", error: err.message });
  }
};
