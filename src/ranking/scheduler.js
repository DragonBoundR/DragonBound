require("module-alias/register");
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const DragonDataBase = require('@infra/db/connection'); // Correct database connection

// Path to the rankingscript.js
const scriptPath = path.join(__dirname, 'rankingscript.js');

// Path to the JSON file that will store update times
const jsonFilePath = path.join(__dirname, '../web/public_html/data/ranking_updated.json');

// Path to the ranking data JSON file
const rankingDataPath = path.join(__dirname, '../web/public_html/data/ranking_data.json');

// Function to execute the rankingscript.js
async function runRankingScript() {
    console.log('Running ranking script...');

    try {
        delete require.cache[require.resolve(scriptPath)];
        require(scriptPath);
        console.log('Ranking script completed successfully.');
    } catch (error) {
        console.error(`Ranking script exited with error: ${error.message}`);
    }
}

// Function to update the JSON file with the last and next update times
async function updateJsonFile() {
    console.log('Updating JSON file...');
    const now = new Date();
    const lastUpdateTime = now.toISOString(); // Current time as ISO string

    // Calculate the next update time (30 minutes later)
    const nextUpdateTime = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

    const data = {
        lastUpdateTime,
        nextUpdateTime
    };

    try {
        console.log(`Writing to file: ${jsonFilePath}`);
        await fs.writeFile(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
        logUpdateTimes(lastUpdateTime, nextUpdateTime);
    } catch (err) {
        console.error(`Error writing to JSON file: ${err.message}`);
    }
}

// Function to log the last and next update times
function logUpdateTimes(lastUpdateTime, nextUpdateTime) {
    const lastUpdate = new Date(lastUpdateTime);
    const nextUpdate = new Date(nextUpdateTime);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    console.log(`Last Updated: ${formatDate(lastUpdate)}`);
    console.log(`Next Update: ${formatDate(nextUpdate)}`);
}

// Function to update the ranking data JSON file
async function updateRankingData() {
    console.log('Updating ranking data...');
    const db = DragonDataBase;
    const pool = await db.init(); // Initialize the pool

    let connection;
    try {
        console.time('Update Ranking Data Execution Time');
        connection = await pool.getConnection(); // Get a connection from the pool

        // Query to get the minimum GP for each rank above rank 11
        const gpQuery = `
            SELECT rank, MIN(gp) as min_gp
            FROM users
            WHERE rank > 11
            GROUP BY rank
            ORDER BY rank ASC
        `;
        const [gpResults] = await connection.query(gpQuery);

        // Query to get the total number of players by rank
        const playerCountQuery = `
            SELECT rank, COUNT(*) as player_count
            FROM users
            GROUP BY rank
            ORDER BY rank ASC
        `;
        const [playerCountResults] = await connection.query(playerCountQuery);

        // Query to get the number of GM and Mod users
        const gmModQuery = `
            SELECT gm, COUNT(*) as count
            FROM users
            WHERE gm IN (1, 2)
            GROUP BY gm
        `;
        const [gmModResults] = await connection.query(gmModQuery);

        // Fixed GP values for ranks 0 to 11
        const fixedGpValues = [1100, 1200, 1500, 1800, 2300, 2800, 3500, 4200, 5100, 6000, 6900, 8764];

        // Prepare the data in the required structure
        const gpValues = new Array(28).fill('-');
        const playerCounts = new Array(28).fill('-');

        // Fill fixed GP values for ranks 0 to 11
        for (let i = 0; i <= 11; i++) {
            gpValues[i] = fixedGpValues[i];
        }

        // Fill dynamic GP values and player counts for ranks 12 to 24 (excluding 21)
        gpResults.forEach(result => {
            if (result.rank <= 24 && result.rank !== 21) {
                gpValues[result.rank] = result.min_gp;
            }
        });

        playerCountResults.forEach(result => {
            if (result.rank <= 24 && result.rank !== 21) {
                playerCounts[result.rank] = result.player_count;
            }
        });

        // Fill GM and Mod counts
        gmModResults.forEach(result => {
            if (result.gm === 1) {
                gpValues[26] = 'GM';
                playerCounts[26] = result.count;
            } else if (result.gm === 2) {
                gpValues[27] = 'Mod';
                playerCounts[27] = result.count;
            }
        });

        // Static values for otherValues as per your example
        const otherValues = [90, 86, 82, 78, 74, 72, 69, 65, 63, 60];

        const rankingData = [
            new Date().getTime(), // Current timestamp
            gpValues,
            playerCounts,
            otherValues
        ];

        // Write the updated data back to the JSON file
        await fs.writeFile(rankingDataPath, JSON.stringify(rankingData, null, 2));
        console.log('Ranking data updated successfully.');
    } catch (error) {
        console.error('Error updating ranking data:', error);
    } finally {
        if (connection) {
            connection.releaseConnection(); // Release the connection back to the pool
        }
        console.timeEnd('Update Ranking Data Execution Time');
    }
}

// Schedule the task to run every 30 minutes
cron.schedule('*/30 * * * *', () => {
    console.log('Cron job triggered');
    runRankingScript();
    updateJsonFile();
    updateRankingData();
});

// Optionally, run the ranking script immediately when the scheduler starts
runRankingScript();
updateJsonFile();
updateRankingData();