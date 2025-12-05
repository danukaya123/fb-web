module.exports = async function handler(req, res) {
  const fetch = (await import("node-fetch")).default;
  const he = (await import("he")).default; // <-- fix here

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const url = (req.query.url || "").toString().trim();
    const title = (req.query.title || "facebook_video").toString().trim();

    if (!url) return res.status(400).send("Missing `url` parameter");

    // Clean title and add brand prefix
    const safeTitle = he.decode(title)
      .normalize("NFC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_")
      .toLowerCase();

    const filename = `quizontal_${safeTitle}.mp4`;

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
