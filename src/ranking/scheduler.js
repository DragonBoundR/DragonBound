const cron = require('node-cron');
const path = require('path');
const { runUpdates } = require('./rankingscript');

// Schedule the task to run every 30 minutes
cron.schedule('*/30 * * * *', () => {
    console.log('Cron job triggered');
    runUpdates().catch(error => {
        console.error('Error running scheduled ranking script:', error);
    });
});

// Optionally, run the script immediately when the scheduler starts
runUpdates().catch(error => {
    console.error('Error running ranking script on startup:', error);
});