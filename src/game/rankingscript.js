const DataBase = require('./database'); // Adjust the path as necessary

async function updateRankings() {
    const db = new DataBase();
    const connection = await db.getConnection().getConnection(); // Get a single connection from the pool

    try {
        // Get the total number of players
        const [rows] = await connection.execute('SELECT COUNT(*) AS total FROM users');
        const totalPlayers = rows[0].total;
        
        // Define thresholds based on total number of players
        const top1SilverDragon = 1; // Top 1 Silver Dragon
        const top5RedDragon = 5; // Top 5 Red Dragon
        const top21BlueDragon = 21; // Top 21 Blue Dragon
        const diamondWand = Math.ceil(totalPlayers * 0.01); // 1% of total players Diamond Wand
        const rubyWand = Math.ceil(totalPlayers * 0.03); // 3% of total players Ruby Wand
        const sapphireWand = Math.ceil(totalPlayers * 0.06); // 6% of total players Sapphire Wand 
        const violetWand = Math.ceil(totalPlayers * 0.12); // 12% of total players Violet Wand
        const goldBattleAxePlus = Math.ceil(totalPlayers * 0.20); // 20% of total players Gold Battle Axe Plus
        const goldBattleAxe = Math.ceil(totalPlayers * 0.32); // 32% of total players Gold Battle Axe
        const silverBattleAxePlus = Math.ceil(totalPlayers * 0.46); // 46% of total players Silver Battle Axe Plus
        const silverBattleAxe = Math.ceil(totalPlayers * 0.62); // 62% of total players Silver Battle Axe
        const battleAxePlus = Math.ceil(totalPlayers * 0.80); // 80% of total players Battle Axe Plus

        // Fetch current ranks and update previous_rank column
        await connection.execute(`UPDATE users SET previous_rank = rank`);
        
        // Update rankings using subqueries
        await connection.execute(`UPDATE users SET rank=24 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${top1SilverDragon}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=23 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${top5RedDragon} OFFSET ${top1SilverDragon}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=22 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${top21BlueDragon} OFFSET ${top5RedDragon}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=20 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${diamondWand} OFFSET ${top21BlueDragon}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=19 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${rubyWand} OFFSET ${top21BlueDragon + diamondWand}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=18 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${sapphireWand} OFFSET ${top21BlueDragon + diamondWand + rubyWand}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=17 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${violetWand} OFFSET ${top21BlueDragon + diamondWand + rubyWand + sapphireWand}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=16 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${goldBattleAxePlus} OFFSET ${top21BlueDragon + diamondWand + rubyWand + sapphireWand + violetWand}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=15 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${goldBattleAxe} OFFSET ${top21BlueDragon + diamondWand + rubyWand + sapphireWand + violetWand + goldBattleAxePlus}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=14 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${silverBattleAxePlus} OFFSET ${top21BlueDragon + diamondWand + rubyWand + sapphireWand + violetWand + goldBattleAxePlus + goldBattleAxe}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=13 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${silverBattleAxe} OFFSET ${top21BlueDragon + diamondWand + rubyWand + sapphireWand + violetWand + goldBattleAxePlus + goldBattleAxe + silverBattleAxePlus}) AS subquery)`);
        await connection.execute(`UPDATE users SET rank=12 WHERE Id IN (SELECT Id FROM (SELECT Id FROM users WHERE gp > 6900 ORDER BY gp DESC LIMIT ${battleAxePlus} OFFSET ${top21BlueDragon + diamondWand + rubyWand + sapphireWand + violetWand + goldBattleAxePlus + goldBattleAxe + silverBattleAxePlus + silverBattleAxe}) AS subquery)`);

        console.log('Rankings updated successfully.');
    } catch (error) {
        console.error('Error updating rankings:', error);
    } finally {
        // Release the connection back to the pool
        if (connection) {
            connection.release();
        }
    }
}

updateRankings();