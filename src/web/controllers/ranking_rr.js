var express = require('express'),
    router = express.Router();

var mysql = require('mysql');
var Logger = require('../../game/lib/logger');
var ignoreCase = require('ignore-case');
var md5 = require('md5');
var constants = require('constants');

router.get('/rr', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var date_unix = Date.now();
    var data = [];
    if (req.query.r == 4 && isNaN(req.query.s)) {
        return null;
    }
    if (req.query.r == 8) {
        req.db.connection.getConnection().then(conn => {
            conn.query('SELECT Id, Name, members, rank, img, fondo, about FROM guild')
                .then(rows1 => {
                conn.release();
                if (rows1[0].length > 0) {
                    let res01 = rows1[0];
                    let next_rank = 0;
                    for (var u in res01) {
                        if (res01[u].members <= 1099) { next_rank = 0; }
                        else if (res01[u].members >= 1100 && res01[u].members <= 1799) { next_rank = 1; }
                        else if (res01[u].members >= 1800 && res01[u].members <= 2499) { next_rank = 2; }
                        else if (res01[u].members >= 2500 && res01[u].members <= 3099) { next_rank = 3; }
                        else if (res01[u].members >= 3100 && res01[u].members <= 3899) { next_rank = 4; }
                        else if (res01[u].members >= 3900 && res01[u].members <= 4399) { next_rank = 5; }
                        else if (res01[u].members >= 4400 && res01[u].members <= 4999) { next_rank = 6; }
                        else if (res01[u].members >= 5000 && res01[u].members <= 5599) { next_rank = 7; }
                        else if (res01[u].members >= 5600 && res01[u].members <= 6099) { next_rank = 8; }
                        else if (res01[u].members >= 6100 && res01[u].members <= 6999) { next_rank = 9; }
                        else if (res01[u].members >= 7000 && res01[u].members <= 7699) { next_rank = 10; }
                        else if (res01[u].members >= 7700 && res01[u].members <= 12462) { next_rank = 11; }
                        else if (res01[u].members >= 12463 && res01[u].members <= 19155) { next_rank = 12; }
                        else if (res01[u].members >= 19156 && res01[u].members <= 31104) { next_rank = 13; }
                        else if (res01[u].members >= 31105 && res01[u].members <= 57843) { next_rank = 14; }
                        else if (res01[u].members >= 57844 && res01[u].members <= 78881) { next_rank = 15; }
                        else if (res01[u].members >= 78882 && res01[u].members <= 117583) { next_rank = 16; }
                        else if (res01[u].members >= 117584 && res01[u].members <= 396573) { next_rank = 17; }
                        else if (res01[u].members >= 396574 && res01[u].members <= 738244) { next_rank = 18; }
                        else if (res01[u].members >= 738245 && res01[u].members <= 1355627) { next_rank = 19; }
                        else if (res01[u].members >= 1355628 && res01[u].members <= 2193433) { next_rank = 20; }
                        else if (res01[u].members >= 2193434 && res01[u].members <= 8632317) { next_rank = 21; }
                        else if (res01[u].members >= 8632318 && res01[u].members <= 19392509) { next_rank = 22; }
                        else if (res01[u].members >= 19392510 && res01[u].members <= 33561221) { next_rank = 23; }
                        else if (res01[u].members >= 33561222) { next_rank = 24; } else {}
                        if (res01[u].rank != next_rank) {
                            if (res01[u].rank <= 25 && res01[u].Name !== 'GM') {
                                var IdGuild = res01[u].Id;
                                conn.query('UPDATE guild SET rank = ? WHERE Id = ?', [next_rank, IdGuild])
                                    .then(rows3 => {
                                    conn.release();
                                    if (rows3[0].affectedRows > 0 || rows3[0].changedRows > 0) {
                                        Logger.info('Guild: ' + res01[u].Name + ' - New Update Rank: ' + next_rank);
                                    } else {
                                        Logger.info('Bug Guild: ' + res01[u].Name + ' - New Update Rank: ' + next_rank);
                                    }
                                    return null;
                                });
                            }
                        }
                    }
                    return null;
                } else {}
            });
            var number_link = parseInt(req.query.s);
            if (number_link === 1)
                number_link = 0;
            conn.query('SELECT Id, Name, members, rank, img, fondo, about FROM guild WHERE rank !=26 AND rank !=27 AND rank !=31 ORDER BY members DESC limit '+number_link+', 30')
                .then(rows => {
                conn.release();
                if (rows.length > 0) {
                    conn.query('SELECT r, last_reset_rankings, next_reset_rankings, time_reset FROM resets_rankings WHERE r = ?', [req.query.r])
                        .then(rows_2 => {
                        conn.release();
                        let res00 = rows_2[0][0];
                        var last_resets_rankings = parseInt(res00.last_reset_rankings);
                        if (res00.next_reset_rankings <= Date.now()) {
                            last_resets_rankings = Date.now();
                            var junior = Date.now();
                            junior = parseInt(res00.last_reset_rankings) + (7 * 24 * 60 * 60 * 1000);
                            req.db.updateResetRankingRiD(Date.now(), junior, req.query.r);
                            req.db.updateResetGPsGuilds(parseInt(1));
                        }
                        let res0 = rows[0];
                        data.push("8");
                        data.push(req.query.s);
                        for (var u in res0) {
                            data.push(res0[u].members, res0[u].rank, res0[u].Name);
                        }
                        data.push([last_resets_rankings,71,parseInt(res00.next_reset_rankings)],date_unix);
                        res.send(JSON.stringify(data));
                    });
                    
                } else {
                    res.send(JSON.stringify([0]));
                }
            });
        });
    }

    else if (req.query.r == 1) {
        req.db.connection.getConnection().then(conn => {
            var number_link = parseInt(req.query.s);
            if (number_link === 1)
                number_link = 0;
            conn.query('SELECT u.game_id, u.gp, u.rank, g.Name FROM users u LEFT JOIN guild_member m ON m.UserId = u.IdAcc LEFT JOIN guild g ON g.Id = m.Id WHERE u.rank !=26 AND u.rank !=27 AND u.rank !=31 ORDER BY u.gp DESC limit '+number_link+', 30')
                .then(rows => {
                conn.release();
                if (rows.length > 0) {
                    let res0 = rows[0];
                    conn.query('SELECT r, last_reset_rankings, next_reset_rankings, time_reset FROM resets_rankings WHERE r = ?', [req.query.r])
                        .then(rows_2 => {
                        conn.release();
                        let res00 = rows_2[0][0];
                        var last_resets_rankings = parseInt(res00.last_reset_rankings);
                        if (res00.next_reset_rankings <= Date.now()) {
                            //SELECT u.game_id, u.gp, u.rank, u.IdAcc, g.Name FROM users u LEFT JOIN guild_member m ON m.UserId = u.IdAcc LEFT JOIN guild g ON g.Id = m.Id WHERE u.rank = 23 ORDER BY u.gp ASC limit 0, 1
                            /* *======================================================================* */
                            conn.query('SELECT u.game_id, u.gp, u.rank, u.IdAcc, g.Name FROM users u LEFT JOIN guild_member m ON m.UserId = u.IdAcc LEFT JOIN guild g ON g.Id = m.Id ORDER BY u.gp DESC limit 0, 1')
                                .then(rows_ranking1 => {
                                conn.release();
                                let ranking_rows1 = rows_ranking1[0][0];
                                conn.query('UPDATE users SET rank = ? WHERE rank !=26 AND gp>=400000 AND rank !=27 AND rank !=31 AND IdAcc = ?', [parseInt(24), parseInt(ranking_rows1.IdAcc)])
                                    .then(rows_ranking1_1 => {
                                    conn.release();
                                    conn.query('SELECT u.game_id, u.gp, u.rank, u.IdAcc, g.Name FROM users u LEFT JOIN guild_member m ON m.UserId = u.IdAcc LEFT JOIN guild g ON g.Id = m.Id ORDER BY u.gp DESC limit 1, 4')
                                        .then(rows_ranking2 => {
                                        conn.release();
                                        let ranking_rows2 = rows_ranking2[0];
                                        for (var xm_rows2 in ranking_rows2) {
                                            conn.query('UPDATE users SET rank = ? WHERE rank !=26  AND gp>=336017 AND rank !=27 AND rank !=31 AND IdAcc = ?', [parseInt(23), parseInt(ranking_rows2[xm_rows2].IdAcc)])
                                                .then(rows_ranking2_1 => {
                                                conn.release();
                                                conn.query('SELECT u.game_id, u.gp, u.rank, u.IdAcc, g.Name FROM users u LEFT JOIN guild_member m ON m.UserId = u.IdAcc LEFT JOIN guild g ON g.Id = m.Id ORDER BY u.gp DESC limit 5, 16')
                                                    .then(rows_ranking3 => {
                                                    conn.release();
                                                    let ranking_rows3 = rows_ranking3[0];
                                                    for (var xm_rows3 in ranking_rows3) {
                                                        conn.query('UPDATE users SET rank = ? WHERE  rank !=26  AND gp>=100300  AND rank !=27 AND rank !=31 AND IdAcc = ?', [parseInt(22), parseInt(ranking_rows3[xm_rows3].IdAcc)])
                                                            .then(rows_ranking3_1 => {
                                                            conn.release();
                                                            conn.query('SELECT u.game_id, u.gp, u.rank, u.IdAcc, g.Name FROM users u LEFT JOIN guild_member m ON m.UserId = u.IdAcc LEFT JOIN guild g ON g.Id = m.Id WHERE u.rank = ? ORDER BY u.gp ASC limit 0, 1', [24])
                                                                .then(rows_ranking4_1 => {
                                                                conn.release();
                                                                conn.query('SELECT u.game_id, u.gp, u.rank, u.IdAcc, g.Name FROM users u LEFT JOIN guild_member m ON m.UserId = u.IdAcc LEFT JOIN guild g ON g.Id = m.Id WHERE u.rank = ? ORDER BY u.gp ASC limit 0, 1', [23])
                                                                    .then(rows_ranking4_2 => {
                                                                    conn.release();

                                                                });
                                                            });
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });
                            });
                            /* *======================================================================* */
                            
                            last_resets_rankings = Date.now();
                            var junior = Date.now();
                            junior = junior + (30 * 1000 * 60);
                            req.db.updateResetRankingRiD(Date.now(), junior, req.query.r);
                        }
                        data.push("1");
                        data.push(req.query.s);
                        for (var u in res0) {
                            data.push(res0[u].gp, res0[u].rank, res0[u].game_id, res0[u].Name ? res0[u].Name : "");
                        }
                        data.push([last_resets_rankings,30,null],Date.now());
                        res.send(JSON.stringify(data));
                    });
                } else {
                    res.send(JSON.stringify([0]));
                }
            });
        });
    }
    else if (req.query.r == 4) {
        req.db.connection.getConnection().then(conn => {
            var number_link = parseInt(req.query.s);
            if (number_link === 1)
                number_link = 0;
            conn.query('SELECT u.game_id, u.rank, u.prixw, g.Name FROM users u LEFT JOIN guild_member m ON m.UserId = u.IdAcc LEFT JOIN guild g ON g.Id = m.Id WHERE u.prixw != 0 AND u.rank !=26 AND u.rank !=27 AND u.rank !=31 ORDER BY u.prixw DESC limit '+number_link+', 30')
                .then(rows => {
                conn.release();
                if (rows.length > 0) {
                    let res0 = rows[0];
                    data.push("1");
                    data.push(req.query.s);
                    for (var u in res0) {
                        data.push(res0[u].prixw, res0[u].rank, res0[u].game_id, res0[u].Name ? res0[u].Name : "");
                    }
                    data.push([date_unix,30,null],date_unix);
                    res.send(JSON.stringify(data));
                } else {
                    res.send(JSON.stringify([0]));
                }
            });
        });
    }
    else if (req.query.r == 3) {
        req.db.connection.getConnection().then(conn => {
            var number_link = parseInt(req.query.s);
            if (number_link === 1)
                number_link = 0;
            conn.query('SELECT Id, Name, points, rank FROM guild WHERE points != 0 AND rank !=26 AND rank !=27 AND rank !=31 ORDER BY points DESC LIMIT '+number_link+', 30')
                .then(rows => {
                conn.release();
                if (rows.length > 0) {
                    let res0 = rows[0];
                    data.push("8");
                    data.push(req.query.s);
                    for (var u in res0) {
                        data.push(res0[u].points, res0[u].rank, res0[u].Name);
                    }
                    data.push([date_unix,30,null],date_unix);
                    res.send(JSON.stringify(data));
                } else {
                    res.send(JSON.stringify([0]));
                }
            });
        });
    } else {
        req.db.connection.getConnection().then(conn => {
            var number_link = parseInt(req.query.s);
            if (number_link === 1)
                number_link = 0;
            var search_range = req.query.r;
            search_range = search_range.replace('w', '');
            var search_code_rank = 'u.rank = ?';
            if (parseInt(search_range) === parseInt(21)) {
                search_code_rank = 'u.rank >= ? AND u.rank <= 24';
            } else {
                search_code_rank = 'u.rank = ?';
            }
            conn.query('SELECT u.game_id, u.ranking_semanal, u.rank, g.Name FROM users u LEFT JOIN guild_member m ON m.UserId = u.IdAcc LEFT JOIN guild g ON g.Id = m.Id WHERE ' + search_code_rank + ' ORDER BY u.ranking_semanal DESC limit ?, 30', [search_range, number_link])
                .then(rows => {
                conn.release();
                if (rows.length > 0) {
                    let res0 = rows[0];
                    conn.query('SELECT r, last_reset_rankings, next_reset_rankings, time_reset FROM resets_rankings WHERE r = ?', [24])
                        .then(rows_2 => {
                        conn.release();
                        let res00 = rows_2[0][0];
                        var last_resets_rankings = parseInt(res00.last_reset_rankings);
                        if (res00.next_reset_rankings <= Date.now()) {
                            last_resets_rankings = Date.now();
                            var junior = Date.now();
                            junior = parseInt(res00.last_reset_rankings) + (7 * 24 * 60 * 60 * 1000);
                            req.db.updateResetRankingRiD(Date.now(), junior, 24);
                            req.db.updateGPsRankingSemanalByIdAcc(parseInt(0), parseInt(0));
                        }
                        data.push(req.query.r);
                        data.push(req.query.s);
                        for (var u in res0) {
                            data.push(res0[u].ranking_semanal, res0[u].rank, res0[u].game_id, res0[u].Name ? res0[u].Name : "");
                        }
                        data.push([last_resets_rankings,30,parseInt(res00.next_reset_rankings)],Date.now());
                        res.send(JSON.stringify(data));
                    });
                } else {
                    res.send(JSON.stringify([0]));
                }
            });
        });
    }
});

module.exports = router;