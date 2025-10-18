export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // Fetch user's gamepasses
    const passesResponse = await fetch(
      `https://games.roblox.com/v1/users/${userId}/game-passes?limit=100`
    );
    const passesData = await passesResponse.json();

    // Fetch user's clothing (shirts + pants)
    const assetsResponse = await fetch(
      `https://inventory.roblox.com/v2/users/${userId}/inventory/11?limit=100`
    );
    const assetsData = await assetsResponse.json();

    // Combine both
    const combinedItems = [];

    // Add gamepasses
    if (passesData && passesData.data) {
      for (const item of passesData.data) {
        combinedItems.push({
          id: item.id,
          name: item.name,
          price: item.price || 0,
          type: "GamePass",
        });
      }
    }

    // Add clothing
    if (assetsData && assetsData.data) {
      for (const item of assetsData.data) {
        combinedItems.push({
          id: item.assetId,
          name: item.name,
          price: item.price || 0,
          type: "Clothing",
        });
      }
    }

    console.log(`✅ Found ${combinedItems.length} items for ${userId}`);
    res.status(200).json(combinedItems);
  } catch (err) {
    console.error("❌ Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch user items" });
  }
}
