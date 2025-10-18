export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // Fetch user-created games
    const gamesRes = await fetch(`https://games.roblox.com/v2/users/${userId}/games?sortOrder=Asc&limit=50`);
    const gamesData = await gamesRes.json();

    let gamepasses = [];

    for (const game of gamesData.data) {
      const passesRes = await fetch(`https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`);
      const passesData = await passesRes.json();
      if (passesData.data && passesData.data.length > 0) {
        for (const pass of passesData.data) {
          gamepasses.push({
            name: pass.name,
            id: pass.id,
            price: pass.price || 0,
            type: "Gamepass",
          });
        }
      }
    }

    // Fetch user-created clothing
    const assetsRes = await fetch(`https://catalog.roblox.com/v1/search/items?creatorTargetId=${userId}&creatorType=User&limit=100`);
    const assetsData = await assetsRes.json();

    const clothing = assetsData.data
      ?.filter(i => ["Shirt", "Pants", "T-Shirt"].includes(i.itemType))
      .map(i => ({
        name: i.name,
        id: i.id,
        price: i.price || 0,
        type: i.itemType,
      })) || [];

    const allItems = [...gamepasses, ...clothing];

    if (allItems.length === 0) {
      return res.status(404).json({ error: "No items found" });
    }

    res.status(200).json(allItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load items" });
  }
}
