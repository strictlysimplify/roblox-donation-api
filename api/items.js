export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const [clothingRes, passesRes] = await Promise.all([
      fetch(`https://catalog.roblox.com/v1/search/items?category=Clothing&creatorTargetId=${userId}&salesTypeFilter=1&limit=30`),
      fetch(`https://games.roblox.com/v1/users/${userId}/game-passes?limit=30`)
    ]);

    const clothing = await clothingRes.json();
    const passes = await passesRes.json();

    res.status(200).json({
      clothing: clothing.data || [],
      passes: passes.data || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
