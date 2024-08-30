const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

// Path to the rankingscript.js
const scriptPath = path.join(__dirname, 'rankingscript.js');

// Path to the JSON file that will store update times
const jsonFilePath = path.join(__dirname, '../web/public_html/data/ranking_updated.json');

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

// Schedule the task to run every 30 minutes
cron.schedule('*/30 * * * *', () => {
    console.log('Cron job triggered');
    runRankingScript();
    updateJsonFile();
});

// Optionally, run the ranking script immediately when the scheduler starts
runRankingScript();
updateJsonFile();