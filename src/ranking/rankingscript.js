require("module-alias/register");
const DragonDataBase = require("@infra/db/connection");

console.log('rankingscript.js started');

async function updateRankings() {
    const db = DragonDataBase;
    const pool = await db.init(); // Initialize the pool

    let connection;
    try {
        console.time('Total Execution Time');
        connection = await pool.getConnection(); // Get a connection from the pool

        console.time('Fetch All Users');
        // Get all users sorted by GP in descending order
        const [allRows] = await connection.execute('SELECT Id, gp FROM users ORDER BY gp DESC');
        console.timeEnd('Fetch All Users');
        
        const totalPlayers = allRows.length;

        console.time('Filter Users');
        // Get all users with GP greater than 8746, sorted by GP in descending order
        const rowsGreater = allRows.filter(row => row.gp > 8746);
        let totalPlayersGreater = rowsGreater.length;

        // Get all users with GP less than or equal to 8746, sorted by GP in descending order
        const rowsLesser = allRows.filter(row => row.gp <= 8746);
        console.timeEnd('Filter Users');

        console.time('Update Previous Rank');
        // Fetch current ranks and update previous_rank column
        await connection.execute(`UPDATE users SET previous_rank = rank`);
        console.timeEnd('Update Previous Rank');

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
            const ids = rows.slice(start, end).map(row => row.Id);
            if (ids.length > 0) {
                await connection.execute(`UPDATE users SET rank = ? WHERE Id IN (${ids.join(',')})`, [rank]);
            }
        };

        // Define the number of players in each rank category
        const SilverDragon = 1;
        const RedDragon = 4;
        const BlueDragon = 16;

        // Rank details array
        const rankDetails = [
            { count: SilverDragon, rank: 24, name: 'Silver Dragon' },
            { count: RedDragon, rank: 23, name: 'Red Dragon' },
            { count: BlueDragon, rank: 22, name: 'Blue Dragon' },
            { count: Math.ceil(totalPlayers * 0.01), rank: 20, name: 'Diamond Wand' },
            { count: Math.ceil(totalPlayers * 0.03), rank: 19, name: 'Ruby Wand' },
            { count: Math.ceil(totalPlayers * 0.06), rank: 18, name: 'Sapphire Wand' },
            { count: Math.ceil(totalPlayers * 0.12), rank: 17, name: 'Violet Wand' },
            { count: Math.ceil(totalPlayers * 0.20), rank: 16, name: 'Gold Battle Axe Plus' },
            { count: Math.ceil(totalPlayers * 0.32), rank: 15, name: 'Gold Battle Axe' },
            { count: Math.ceil(totalPlayers * 0.46), rank: 14, name: 'Silver Battle Axe Plus' },
            { count: Math.ceil(totalPlayers * 0.62), rank: 13, name: 'Silver Battle Axe' },
            { count: Math.ceil(totalPlayers * 0.80), rank: 12, name: 'Battle Axe Plus' }
        ];

        let currentIndex = 0;

        console.time('Update Ranks for GP > 8746');
        for (const { count, rank, name } of rankDetails) {
            await updateRanks(currentIndex, currentIndex + count, rowsGreater, rank);
            currentIndex += count;
            totalPlayersGreater -= count;
        }
        console.timeEnd('Update Ranks for GP > 8746');

        console.time('Update Ranks for GP <= 8746');
        // Batch update rankings for users with GP <= 8746
        const batchSize = 100; // Adjust batch size as needed
        for (let i = 0; i < rowsLesser.length; i += batchSize) {
            const batch = rowsLesser.slice(i, i + batchSize);
            const updates = batch.map(row => ({
                id: row.Id,
                rank: determineRank(row.gp)
            }));
            const ids = updates.map(update => update.id);
            const ranks = updates.map(update => update.rank);
            await connection.execute(`UPDATE users SET rank = CASE Id ${ids.map((id, index) => `WHEN ${id} THEN ${ranks[index]}`).join(' ')} END WHERE Id IN (${ids.join(',')})`);
        }
        console.timeEnd('Update Ranks for GP <= 8746');

        console.log('Rankings updated successfully.');
        console.timeEnd('Total Execution Time');
    } catch (error) {
        console.error('Error updating rankings:', error);
    } finally {
        // Release the connection back to the pool
        if (connection) {
            connection.releaseConnection();
            console.log('Connection released.');
        }
    }
}

updateRankings().then(() => {
    console.log('rankingscript.js completed');
}).catch(error => {
    console.error('Error in rankingscript.js:', error);
});