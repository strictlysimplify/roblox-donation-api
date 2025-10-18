export default async function handler(req, res) {
  const { userId, username } = req.query;

  if (!userId && !username) {
    return res.status(400).json({ error: "Missing userId or username" });
  }

  try {
    // If username is not provided, fetch it using the userId
    let creatorName = username;
    if (!creatorName) {
      const userInfo = await fetch(`https://users.roblox.com/v1/users/${userId}`);
      const userData = await userInfo.json();
      creatorName = userData.name;
    }

    const SubCategories = ["2", "11", "12"]; // T-Shirt, Shirt, Pants
    const allItems = [];

    // Loop through clothing categories
    for (const sub of SubCategories) {
      let cursor = "";
      do {
        const url = `https://catalog.roproxy.com/v1/search/items/details?Category=3&Subcategory=${sub}&Sort=4&Limit=30&CreatorName=${creatorName}&cursor=${cursor}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.data) {
          for (const item of data.data) {
            if (item.price && item.price > 0 && item.itemRestrictions.length === 0) {
              allItems.push({
                id: item.id,
                name: item.name,
                price: item.price,
                type: "Clothing",
              });
            }
          }
        }

        cursor = data.nextPageCursor || "";
      } while (cursor);
    }

    // Also get Gamepasses
    const gamesResponse = await fetch(`https://games.roblox.com/v2/users/${userId}/games?limit=10`);
    const gamesData = await gamesResponse.json();

    if (gamesData && gamesData.data) {
      for (const game of gamesData.data) {
        const passesResponse = await fetch(
          `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=50`
        );
        const passesData = await passesResponse.json();

        if (passesData && passesData.data) {
          for (const pass of passesData.data) {
            if (pass.price && pass.price > 0) {
              allItems.push({
                id: pass.id,
                name: pass.name,
                price: pass.price,
                type: "GamePass",
              });
            }
          }
        }
      }
    }

    console.log(`✅ Found ${allItems.length} items for ${creatorName}`);
    res.status(200).json(allItems);
  } catch (err) {
    console.error("❌ Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch user items" });
  }
}
