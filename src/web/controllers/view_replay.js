var express = require('express'),
    router = express.Router();

var mysql = require('mysql');
var Logger = require('../../game/lib/logger');
var ignoreCase = require('ignore-case');
var md5 = require('md5');
var constants = require('constants');
var fs = require('fs');
var db = require('../../game/data');

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
        res.push(itm[2]);
        res.push(itm[4]);
        res.push(itm[7]);
    }
    return res;
}

function ArrayToObject(a, b) {
    var c, d = b.length, e = {};
    for (c = 0; c < d; c++)
        e[b[c]] = a[c];
    return e
}

function ava_type(type) {
    var x = "";
    if (type === 0)
        x = "h";
    else if (type === 1)
        x = "b";
    else if (type === 2)
        x = "g";
    else if (type === 3)
        x = "f";
    else if (type === 4)
        x = "1";
    else if (type === 5)
        x = "2";
    else
        x = "x";
    return x;
}

router.get('/:Replay', function (req, res) {
    var Replay = req.params.Replay;
    Logger.log("Replay: [" + Replay + "]");
    Replay = mysql.escape(Replay).replace("'", "").replace("'", "");
    var tmbuser = Replay;
    var tmusr = tmbuser.toLowerCase();
    if (Buffer.byteLength(Replay, 'utf8') < 10) {
        try {
            req.db.connection.getConnection().then(conn => {
                conn.query('SELECT replay_id, view_code, avatars_ids, code_rmd FROM view_replay WHERE view_code = ?', [tmusr])
                    .then(rows => {
                    conn.release();
                    if (rows[0].length > 0) {
                        var rows_length = rows[0];
                        var avatars = "";
                        var ids_avatars = JSON.parse(rows_length[0].avatars_ids);
                        Logger.info("Avatars: "+ids_avatars+" - length: "+ids_avatars.length);
                        for (var i = 0; i < ids_avatars.length; i++) {
                            var ava_date_head = getAvatar(parseInt(ids_avatars[i][0]));
                            ava_date_head = ArrayToObject(ava_date_head, ["type", "filename", "graphics"]);
                            avatars += '<div class="Avatar hide" data-id="'+parseInt(ids_avatars[i][1])+'" data-type="'+ava_type(ava_date_head.type)+'" data-file="'+ava_date_head.filename+'" data-grp="'+JSON.stringify(ava_date_head.graphics)+'"></div>';
                            /* ------------------------------------------------------------------------- */
                            var ava_date_body = getAvatar(parseInt(ids_avatars[i][1]));
                            ava_date_body = ArrayToObject(ava_date_body, ["type", "filename", "graphics"]);
                            avatars += '<div class="Avatar hide" data-id="'+parseInt(ids_avatars[i][0])+'" data-type="'+ava_type(ava_date_body.type)+'" data-file="'+ava_date_body.filename+'" data-grp="'+JSON.stringify(ava_date_body.graphics)+'"></div>';
                            /* ------------------------------------------------------------------------- */
                            var ava_date_eyes = getAvatar(parseInt(ids_avatars[i][2]));
                            ava_date_eyes = ArrayToObject(ava_date_eyes, ["type", "filename", "graphics"]);
                            avatars += '<div class="Avatar hide" data-id="'+parseInt(ids_avatars[i][2])+'" data-type="'+ava_type(ava_date_eyes.type)+'" data-file="'+ava_date_eyes.filename+'" data-grp="'+JSON.stringify(ava_date_eyes.graphics)+'"></div>';
                            /* ------------------------------------------------------------------------- */
                            var ava_date_flag = getAvatar(parseInt(ids_avatars[i][3]));
                            ava_date_flag = ArrayToObject(ava_date_flag, ["type", "filename", "graphics"]);
                            avatars += '<div class="Avatar hide" data-id="'+parseInt(ids_avatars[i][3])+'" data-type="'+ava_type(ava_date_flag.type)+'" data-file="'+ava_date_flag.filename+'" data-grp="'+JSON.stringify(ava_date_flag.graphics)+'"></div>';
                            /* ------------------------------------------------------------------------- */
                        }
                        fs.readFile('./replays/'+rows_length[0].view_code+'.json', (err, data) => {
                            if(err) {
                                Logger.debug('error w2 fs: '+err);
                            } else {
								let datt = JSON.parse(data);
                                res.render('replay', {
                                    avatars: avatars,
                                    code_rmd: rows_length[0].code_rmd,
                                    replay_code: [datt]
                                });
                            }
                        });
                    } else {
                        res.send(JSON.stringify("User not found"));
                    }
                });
            });
        } catch (e) {
            Logger.debug("Replay [ERROR]: " + e.stack);
            res.redirect('/');
        }
    }
});

module.exports = router;