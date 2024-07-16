var express = require('express'),
    router = express.Router();

var mysql = require('mysql');
var Logger = require('../../game/lib/logger');
var ignoreCase = require('ignore-case');
var md5 = require('md5');
var constants = require('constants');
var graph = require('fbgraph');
var geoip = require('geoip-lite');
var Promise = require('promise');

function pin_code_generador(length, current) {
  current = current ? current : '';
  return length ? pin_code_generador(--length, "0123456789".charAt(Math.floor(Math.random() * 10)) + current) : current;
}

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
    var reg = /([^f:]+)/;
    var ip_result = reg.exec(req.connection.remoteAddress)[0];
	var computer_ip = req.body.computer_ip;
	var my_player_country = req.body.my_player_country;
	
	if (computer_ip === '190.42.88.35' || computer_ip === '200.121.230.20' || computer_ip === '200.8.145.186' || computer_ip === '179.6.220.6') {
        res.send(JSON.stringify(['Your IP Was Forbidden In The Game!']));
        return null;
    }
	
    var country = "PE";
    if (ip) {
        var tmpip = ip.split(',');
        var geo = geoip.lookup(tmpip[0]);
        if (geo)
            country = geo.country;
    }
    if (req.session) {
        if (req.session.account_id) {
            req.session.touch();
            var acc_id = req.session.account_id;
            var rank = req.session.rank;
            var acc_session = req.session.acc_session;
            res.send(JSON.stringify([acc_id, rank, 0, acc_session, my_player_country, 0]));
        } else {
            res.send(JSON.stringify([0]));
        }
    } else {
        res.send(JSON.stringify([0]));
    }
});

router.post('/', function (req, res) {
    if (req.body.a) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        var reg = /([^f:]+)/;
        var ip_result = reg.exec(req.connection.remoteAddress)[0];
		
		var computer_ip = req.body.computer_ip;
        var my_player_country = req.body.my_player_country;
        
        //Logger.normal("Computer IP: "+req.body.computer_ip+" - Country Player: "+req.body.my_player_country);
		
        /*if (ip_result !== '181.64.57.76') {
            res.send(JSON.stringify(['You are not allowed to enter']));
            return null;
        }*/
        if (computer_ip === '190.42.88.35' || computer_ip === '200.121.230.20' || computer_ip === '200.8.145.186' || computer_ip === '179.6.220.6' || computer_ip === '181.64.91.50') {
        res.send(JSON.stringify(['Your IP Was Forbidden In The Game!']));
        return null;
    }
        var country = "PE";
        if (ip) {
            var tmpip = ip.split(',');
            var geo = geoip.lookup(tmpip[0]);
            if (geo)
                country = geo.country;
        }
        graph.setAccessToken(req.body.a);
        graph.get('/me?fields=id,name,birthday,email,gender', function (err, res_fb) {
            if (err) {
                Logger.info("POST - Login facebook in test mode number: 1 - Error: ["+JSON.stringify(err)+"]");
                /*res.send(JSON.stringify([0]));*/
                res.send("Maintenance :(");
            } else {
                var id = res_fb.id;
                var name = res_fb.name;
                var email = '';
                var gender = "m";
                var birthday = new Date();
                var CheckPinUser = pin_code_generador(4);
                if (res_fb.email)
                    email = res_fb.email;
                if (res_fb.gender)
                    if (res_fb.gender === 'female' || res_fb.gender === 'mujer')
                        gender = "f";
                if (res_fb.birthday) {
                    var tmpbirth = res_fb.birthday.split('/');
                    birthday = tmpbirth[2] + "-" + tmpbirth[1] + "-" + tmpbirth[0];
                }

                req.db.getAccountByFBId(id)
                    .then(function (rows) {
                        var res0 = rows[0][0];
                        req.db.getUserByIdAcc(res0.Id)
                            .then(function (rows2) {
                                var res1 = rows2[0][0];
                                req.session.cookie.expires = false;
                                req.session.cookie.maxAge = new Date(Date.now() + (60 * 1000 * 1440));
                                req.session.account_id = res0.Id;
                                req.session.rank = res1.rank;
                                req.session.acc_session = res0.Session;
                                req.session.game_id = res1.game_id;
								req.session.gender = res1.gender;
                                if (res1.banned === 1) {
                                    req.db.getUserByBannedTest(res0.Id)
                                        .then(function (dbplay) {
                                           var dbtt = dbplay[0][0];
                                           res.send(JSON.stringify([dbtt.razon, dbtt.date, 0]));
                                           return null;
                                    });
                                }
                                if (res1.banned === 1) {
                                    req.db.getUserByBannedTest(res0.Id)
                                        .then(function (dbplay) {
                                           var dbtt = dbplay[0][0];
                                           if (dbtt.date === 'Forever') {
                                               res.send(JSON.stringify([dbtt.razon, dbtt.date, 0]));
                                               return null;
                                           } else {
                                               if (Date.now() >= parseInt(dbtt.date)) {
                                                   req.db.deleteBannedByIdAcc(res0.Id);
                                                   req.db.updateBannedStatus(0, res0.Id);
                                                   res.status(500).send('The ban was removed from your account, you are kindly asked to login to your account again.');
                                               } else {
                                                   res.send(JSON.stringify([dbtt.razon, DateBan(parseInt(dbtt.date)), 0]));
                                                   return null;
                                               }
                                           }
                                    });
                                }
                                if (res1.banned === 0) {
                                    res.send(JSON.stringify([res0.Id, res1.rank, 0, res0.Session, res1.game_id, res1.gender]));
                                    req.db.deleteAvatarExpireByUserId(Date.now(), res0.Id);
                                    req.db.updateIpComputerUsers(computer_ip, res0.Id);
                                    req.db.updateAccountByIpComputer(computer_ip, res0.Id);
                                    req.db.getRankSpecialByIdAcc(res0.Id)
                                        .then(function (dbbplay) {
                                           var dbbtt = dbbplay[0][0];
                                           var time = Date.now();
                                           if (dbbtt.time < time) {
                                               req.db.updateRankSpecialByIdAcc(0, 0, res0.Id);
                                               req.db.deleteSistemRankSpecialByIdAcc(res0.Id);
                                           }
                                    });
                                }
                            });
                    })
                    .catch(function (err) {
                        if (err) {} else {
                            var dt2 = {
                                Email: email,
                                Name: name+'_'+id,
                                Password: md5(name + ":fbid:" + id),
                                PinUser: CheckPinUser,
                                Salt: ':fbid:',
                                Session: md5(name + ":" + gender),
                                views: 0,
                                IsOnline: 0,
                                Birthday: birthday,
                                facebook_id: id,
                                IP: computer_ip,
                            };
                            req.db.putAccountFB(dt2)
                                .then(function (result) {
                                    var uid = result[0].insertId;
                                    var datos = {
                                        game_id: name,
                                        rank: 0,
                                        gp: 1100,
                                        gold: 5000000,
                                        cash: 250000,
                                        gender: gender,
                                        unlock2: 0,
                                        photo_url: '' + id,
                                        name_changes: 0,
                                        power_user: 0,
                                        plus10gp: 0,
                                        mobile_fox: 0,
                                        country: my_player_country,
                                        flowers: 0,
                                        map_pack: 0,
                                        megaphones: 0,
                                        is_muted: 0,
                                        banned: 0,
                                        prixw: 0,
                                        probability: 0,
                                        IdAcc: uid,
                                        IP: computer_ip,
                                        block_friend: 0,
                                        CashCharger: 0,
                                        ranking_semanal: 0
                                    };
                                    req.db.putUserFB(datos)
                                        .then(function (result2) {
                                            var nnid = result2[0].insertId;
                                            var head = 1;
                                            var body = 2;
                                            if (gender === 'f') {
                                                head = 3;
                                                body = 4;
                                            }
                                            var nxdi = {
                                                Id: nnid,
                                                head: head,
                                                body: body,
                                                eyes: 0,
                                                flag: 0,
                                                background: 0,
                                                foreground: 0
                                            };
                                            req.db.putAvatarUseFB(nxdi)
                                                .then(function (rows4) {
                                                    req.session.cookie.expires = false;
                                                    req.session.cookie.maxAge = new Date(Date.now() + (60 * 1000 * 1440));
                                                    req.session.account_id = uid;
                                                    req.session.rank = datos.rank;
                                                    req.session.acc_session = dt2.Session;
                                                    req.session.game_id = name;
												                          	req.session.gender = gender;
                                                    res.send(JSON.stringify([uid, datos.rank, 0, dt2.Session, name, gender]));
                                                    req.db.putRelationNew(result[0].insertId);
                                                    //req.db.putFriends(result[0].insertId, result[0].insertId);
                                                });
                                        });
                                });
                        }
                    });
            }
        });
    }
});


module.exports = router;