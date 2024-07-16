var express = require('express'),
    router = express.Router();

var mysql = require('mysql');
var Logger = require('../../game/lib/logger');
var ignoreCase = require('ignore-case');
var md5 = require('md5');
var constants = require('constants');

var db = require('../../game/data');

function Commatize(b) {
    return b.toString().replace(/(\d)(?=(\d{3})+$)/g, "$1,")
}

function getAvatar(id) {
    //Logger.log("getAvatar: " + id);
    var itm = [];
    var res = [];
    for (var i = 0; i < db.length; i++) {
        var n = db[i];
        if (n[0] == id) {
            itm = n;
            break;
        }
    }
    if (itm !== null && itm.length > 0) {
        res.push(itm[0]);
        res.push(itm[2]);
        res.push(itm[3]);
        res.push(itm[5]);
        res.push(itm[6].cash_perm);
    }
    return res;
}

function ArrayToObject(a, b) {
    var c, d = b.length, e = {};
    for (c = 0; c < d; c++)
        e[b[c]] = a[c];
    return e
}

router.get('/u/:user_id/avatars', function (req, res) {
    var user_id = req.params.user_id;
    req.db.connection.getConnection().then(conn => {
        conn.query('SELECT IdAcc, game_id, rank, gp, gold, cash, photo_url, bg_url, country FROM users WHERE IdAcc = ?', [parseInt(user_id)])
            .then(rows1 => {
            conn.release();
            if (rows1[0].length > 0) {
                var rows = rows1[0];
                var login = false;
                var loguser = "";
                var img = "/static/images/fb_boy.gif";
                var back = "/static/images/aqua_bg.jpg";
                var session_login = false;
                if (parseInt(req.session.account_id) === parseInt(rows[0].IdAcc) || req.session.rank === 31) {
                    session_login = true;
                }
                if (req.session) {
                   if (req.session.account_id) {
                       login = true;
                       loguser = req.session.game_id;
                   } 
                }
                if (rows[0].photo_url.length > 0)
                    img = rows[0].photo_url;
                conn.query('SELECT Id, UserId, aId, type, expire, is_cash, is_gift, gift_sent_by, amount, expire_time, date_ava_time, remove_ava FROM user_avatars WHERE UserId = ?', [parseInt(user_id)])
                    .then(rows2 => {
                    conn.release();
                    if (rows2[0].length > 0) {
                        var rows_x2 = rows2[0];
                        var texto_test = "";
                        //texto_test += '';
                        for (var i = 0; i < rows_x2.length; i++) {
                            var ava_date = getAvatar(parseInt(rows_x2[i].aId));
                            var type = "",
                                gender;
                            ava_date = ArrayToObject(ava_date, ["id", "type", "gender", "name", "cash_perm"]);
                            if (rows_x2[i].remove_ava === 0)
                                texto_test += '<tr>';
                            else
                                texto_test += '<tr class="Expired">';
                            var type = ava_date.type == 0 ? "Head" : ava_date.type == 1 ? "Body" : ava_date.type == 2 ? "Glass" : ava_date.type == 3 ? "Flag" : ava_date.type == 4 ? "Background" : ava_date.type == 5 ? "Foreground" : ava_date.type == 6 ? "Ex-Iten" : "undefined",
                                gender = ava_date.gender == 0 ? "Male" : ava_date.gender == 1 ? "Female" : "Male";
                            texto_test += '<td><nobr>'+ava_date.id+' - '+ava_date.name+' ['+type+' '+gender+']</nobr></td>';
                            texto_test += '<td class="center"></td>';
                            texto_test += '<td><nobr><script>TD('+ Math.round(new Date(parseInt(rows_x2[i].date_ava_time)).getTime()/1000.0) + ')</script></nobr></td>';
                            texto_test += '<td>Limitless</td>';
                            if (rows_x2[i].is_cash === 1)
                                texto_test += '<td class="center"><div class="yes"></div></td>';
                            else
                                texto_test += '<td class="center"></td>';
                            if (rows_x2[i].is_gift === 1)
                                texto_test += '<td class="center"><div class="yes"></div></td>';
                            else
                                texto_test += '<td class="center"></td>';
                            texto_test += '<td class="right">'+Commatize(ava_date.cash_perm)+'</td>';
                            if (rows_x2[i].remove_ava === 0)
                                texto_test += '<td class="center"></td>';
                            else
                                texto_test += '<td class="center"><div class="yes"></div></td>';
                            if (rows_x2[i].remove_ava === 0)
                                texto_test += '<td></td>';
                            else
                                texto_test += '<td><form method="POST"><input type="hidden" name="csrfmiddlewaretoken" value="BKSBKASBDKABlansdkabs7dBAKBASBDbakbdJBAKSBDAJBSjabksdb"><input type="hidden" name="undelete_id" value="'+rows_x2[i].Id+'"><button>UnDelete</button></form></td>';
                            texto_test += '</tr>';
                        }
                        res.render('remove_ava', {
                            game_id: rows[0].game_id,
                            user_id: rows[0].IdAcc,
                            background: rows[0].bg_url,
                            rank: rows[0].rank,
                            login: login,
                            login_id: loguser,
                            user_img: new Buffer(img).toString('base64'),
                            avatars: texto_test,
                            session_login: session_login
                        });
                    } else {
                        res.render('remove_ava', {
                            game_id: rows[0].game_id,
                            user_id: rows[0].IdAcc,
                            background: rows[0].bg_url,
                            rank: rows[0].rank,
                            login: login,
                            login_id: loguser,
                            user_img: new Buffer(img).toString('base64'),
                            avatars: "",
                            session_login: session_login
                        });
                    }
                });
            } else {
                Logger.debug("Remove Ava Faild!");
                res.redirect('/');
            }
        });
    });
});

router.post('/u/:user_id/avatars', function (req, res) {
    var login = false;
    var loguser = "";
    var undelete_id = req.body.undelete_id;
    if (req.session.account_id) {
        login = true;
        loguser = req.session.game_id;
    }
    req.db.connection.getConnection().then(conn => {
        conn.query('UPDATE user_avatars SET remove_ava = 0 WHERE Id = ?', [undelete_id])
            .then(rows1 => {
            conn.release();
            if (rows1[0].affectedRows > 0 || rows1[0].changedRows > 0) {
                res.redirect(req.get('referer'));
            } else {
                Logger.debug("Remove Ava Faild - POST!");
                res.redirect(req.get('referer'));
            }
        });
    });
});

module.exports = router;