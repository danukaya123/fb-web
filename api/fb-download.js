// api/fb-download.js
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const url = (req.query.url || "").toString().trim();
    if (!url) return res.status(400).send("Missing `url` parameter");

    const filename = "facebook_video.mp4";

    // Fetch video from FB CDN
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch video");

    // Force download headers
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Stream to browser
    response.body.pipe(res);
  } catch (err) {
    console.error("FB Download error:", err);
    res.status(500).send("Failed to download video");
  }
};
