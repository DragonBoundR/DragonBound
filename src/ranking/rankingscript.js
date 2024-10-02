require("module-alias/register");
const fs = require("fs").promises;
const path = require("path");
const DataBase = require("@infra/db/connection");

// Paths for the JSON files
const jsonFilePath = path.join(
  __dirname,
  "../web/public_html/data/ranking_updated.json"
);
const rankingDataPath = path.join(
  __dirname,
  "../web/public_html/data/ranking_data.json"
);

// Function to log update times in JSON
async function updateJsonFile() {
  const now = new Date();
  const lastUpdateTime = now.toISOString();
  const nextUpdateTime = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

  const data = {
    lastUpdateTime,
    nextUpdateTime,
  };

  try {
    console.log(`Writing to file: ${jsonFilePath}`);
    await fs.writeFile(jsonFilePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Last Updated: ${formatDate(new Date(lastUpdateTime))}`);
    console.log(`Next Update: ${formatDate(new Date(nextUpdateTime))}`);
  } catch (err) {
    console.error(`Error writing to JSON file: ${err.message}`);
  }
}

// Helper function to format date
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

async function logPoolStatus(pool) {
  try {
    const [rows] = await pool.query('SHOW STATUS LIKE "Threads_connected"');
    const activeConnections = rows.find(
      (row) => row.Variable_name === "Threads_connected"
    ).Value;
    console.log(`Active connections: ${activeConnections}`);
  } catch (error) {
    console.error("Error fetching pool status:", error);
  }
}

// Ranking logic and data update
async function updateRankings() {
  const db = await DataBase.init();
  const pool = db.getConnection(); // Use the existing pool

  if (!pool) {
    throw new Error("Database pool is not initialized.");
  }

  let connection;
  try {
    connection = await pool.getConnection();
    console.time("Total Execution Time");

    // Log pool status before executing queries
    logPoolStatus(pool);

    // Get all users sorted by GP in descending order
    const [allRows] = await connection.execute(
      "SELECT Id, gp, gm FROM users ORDER BY gp DESC"
    );
    const totalPlayers = allRows.length;

    // Users with GP greater than 8746
    const rowsGreater = allRows.filter((row) => row.gp > 8746 && row.gm !== 1);
    // Users with GP less than or equal to 8746
    const rowsLesser = allRows.filter((row) => row.gp <= 8746 && row.gm !== 1);

    // Update previous ranks before recalculating the new ranks
    await connection.execute(`UPDATE users SET previous_rank = rank`);

    // Function to determine rank based on GP
    const determineRank = (gp) => {
      if (gp <= 1099) return 0;
      if (gp >= 1100 && gp <= 1199) return 1;
      if (gp >= 1200 && gp <= 1499) return 2;
      if (gp >= 1500 && gp <= 1799) return 3;
      if (gp >= 1800 && gp <= 2299) return 4;
      if (gp >= 2300 && gp <= 2799) return 5;
      if (gp >= 2800 && gp <= 3499) return 6;
      if (gp >= 3500 && gp <= 4199) return 7;
      if (gp >= 4200 && gp <= 5099) return 8;
      if (gp >= 5100 && gp <= 5999) return 9;
      if (gp >= 6000 && gp <= 6899) return 10;
      if (gp >= 6900 && gp <= 8746) return 11;
      return 12; // Default rank for GP > 8746
    };

    // Function to update ranks in batches
    const updateRanks = async (start, end, rows, rank) => {
      const ids = rows.slice(start, end).map((row) => row.Id);
      if (ids.length > 0) {
        await connection.execute(
          `UPDATE users SET rank = ? WHERE Id IN (${ids.join(",")})`,
          [rank]
        );
      }
    };

    // Ranking details for top players
    const rankDetails = [
      { count: 1, rank: 24 }, // Silver Dragon
      { count: 4, rank: 23 }, // Red Dragon
      { count: 16, rank: 22 }, // Blue Dragon
      { count: Math.ceil(totalPlayers * 0.01), rank: 20 }, // Diamond Wand
      { count: Math.ceil(totalPlayers * 0.03), rank: 19 }, // Ruby Wand
      { count: Math.ceil(totalPlayers * 0.06), rank: 18 }, // Sapphire Wand
      { count: Math.ceil(totalPlayers * 0.12), rank: 17 }, // Violet Wand
      { count: Math.ceil(totalPlayers * 0.2), rank: 16 }, // Gold Battle Axe Plus
      { count: Math.ceil(totalPlayers * 0.32), rank: 15 }, // Gold Battle Axe
      { count: Math.ceil(totalPlayers * 0.46), rank: 14 }, // Silver Battle Axe Plus
      { count: Math.ceil(totalPlayers * 0.62), rank: 13 }, // Silver Battle Axe
      { count: Math.ceil(totalPlayers * 0.8), rank: 12 }, // Battle Axe Plus
    ];

    let currentIndex = 0;
    for (const { count, rank } of rankDetails) {
      await updateRanks(currentIndex, currentIndex + count, rowsGreater, rank);
      currentIndex += count;
    }

    // Batch update for users with GP <= 8746
    const batchSize = 100;
    for (let i = 0; i < rowsLesser.length; i += batchSize) {
      const batch = rowsLesser.slice(i, i + batchSize);
      const updates = batch.map((row) => ({
        id: row.Id,
        rank: determineRank(row.gp),
      }));
      const ids = updates.map((update) => update.id);
      const ranks = updates.map((update) => update.rank);
      await connection.execute(
        `UPDATE users SET rank = CASE Id ${ids
          .map((id, index) => `WHEN ${id} THEN ${ranks[index]}`)
          .join(" ")} END WHERE Id IN (${ids.join(",")})`
      );
    }

    // Update ranks for GMs
    const gmIds = allRows.filter((row) => row.gm === 1).map((row) => row.Id);
    if (gmIds.length > 0) {
      await connection.execute(
        `UPDATE users SET rank = 26 WHERE Id IN (${gmIds.join(",")})`
      );
    }

    // Write ranking data to JSON file
    const gpValues = new Array(28).fill("-");
    const playerCounts = new Array(28).fill("-");

    const fixedGpValues = [
      1000, 1100, 1200, 1500, 1800, 2300, 2800, 3500, 4200, 5100, 6000, 6900,
      8764,
    ];
    for (let i = 0; i <= 11; i++) {
      gpValues[i] = fixedGpValues[i];
    }

    const gpQuery = `
            SELECT \`rank\`, MIN(gp) as min_gp
            FROM users
            WHERE rank > 11
            GROUP BY rank
            ORDER BY rank ASC
        `;
    const [gpResults] = await connection.query(gpQuery);

    gpResults.forEach((result) => {
      if (result.rank <= 24 && result.rank !== 21) {
        gpValues[result.rank] = result.min_gp;
      }
    });

    const playerCountQuery = `
            SELECT \`rank\`, COUNT(*) as player_count
            FROM users
            GROUP BY rank
            ORDER BY rank ASC
        `;
    const [playerCountResults] = await connection.query(playerCountQuery);

    playerCountResults.forEach((result) => {
      if (result.rank <= 24 && result.rank !== 21) {
        playerCounts[result.rank] = result.player_count;
      }
    });

    const gmModQuery = `
            SELECT gm, COUNT(*) as count
            FROM users
            WHERE gm IN (1, 2)
            GROUP BY gm
        `;
    const [gmModResults] = await connection.query(gmModQuery);

    gmModResults.forEach((result) => {
      if (result.gm === 1) {
        gpValues[26] = "-";
        playerCounts[26] = result.count;
      } else if (result.gm === 2) {
        gpValues[27] = "-";
        playerCounts[27] = result.count;
      }
    });

    const otherValues = [90, 86, 82, 78, 74, 72, 69, 65, 63, 60];
    const rankingData = [
      new Date().getTime(),
      gpValues,
      playerCounts,
      otherValues,
    ];

    await fs.writeFile(rankingDataPath, JSON.stringify(rankingData, null, 2));

    console.timeEnd("Total Execution Time");

    // Log pool status after executing queries
    logPoolStatus(pool);
  } catch (error) {
    console.error("Error updating rankings:", error);
  } finally {
    if (connection) {
      connection.release();
      console.log("Connection released.");
    }
  }
}

// Run the updates
async function runUpdates() {
  await updateRankings();
  await updateJsonFile();
  console.log("Ranking Script Completed Successfully.");
}

// Export the function for use in the scheduler
module.exports = {
  runUpdates,
};

// Execute the script immediately
if (require.main === module) {
  runUpdates().catch((error) => {
    console.error("Error running ranking script:", error);
  });
}
