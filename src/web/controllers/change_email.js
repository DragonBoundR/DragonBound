var express = require('express'),
router = express.Router();
var mysql = require('mysql');
var Logger = require('../../game/lib/logger');
var constants = require('constants');
router.get('/', function (req, res) {
    console.log(req.body);
    var login = false;
    if (req.session.account_id) {
        req.session.touch();
        var user_id = req.session.account_id;
        var game_id = req.session.game_id;
        var login = true;
        req.db.getExchange(user_id)
            .then(function (rows2) {
            var res1 = rows2[0][0];
            var id = res1.IdAcc;
            var nick = res1.game_id;
            var change = res1.name_changes;
            var gold = res1.gold;
            var cash = res1.cash;
            var gp = res1.gp;
            var perfil = res1.photo_url;
            var bg = res1.bg_url;
            var correo = res1.email;
            var status = false;
            if (correo == ""){
                correo = "None";
                status = true;
            }
            res.render('change_email',{
                status : status,
                game_id : game_id,
                login : login,
                login_id: game_id,
                id : id,
                nick : nick,
                perfil : perfil,
                bg : bg,
                change : change,
                cash : cash,
                gold : gold ,
                gp : gp,
                correo : correo
            });
        })
    } else {
        var url = req.baseUrl;
        res.redirect('/login?next='+url); 
    }
});
router.post('/', function (req, res) {
    console.log(req.body);
    var new_correo = req.body.new_email;
    var password = req.body.password;//contraseña del jugador
    var login = false;
    if (req.session.account_id) {
        req.session.touch();
        var user_id = req.session.account_id;
        var game_id = req.session.game_id;
        var login = true;
        req.db.getExchange(user_id)
            .then(function (rows2) {
            var res1 = rows2[0][0];
            var id = res1.IdAcc;
            var nick = res1.game_id;
            var change = res1.name_changes;
            var gold = res1.gold;
            var cash = res1.cash;
            var gp = res1.gp;
            var perfil = res1.photo_url;
            var bg = res1.bg_url;
            var correo = res1.email;
            if (correo == "")
                correo = "None";
            res.render('change_email',{
                game_id : game_id,
                login : login,
                login_id: game_id,
                id : id,
                nick : nick,
                perfil : perfil,
                bg : bg,
                change : change,
                cash : cash,
                gold : gold ,
                gp : gp,
                correo : correo
            });
        })
		if (new_correo) {
			console.log("Email cambiado correctamente");
			req.db.getEmail(new_correo, user_id);
		}
    } else {
        var url = req.baseUrl;
        res.redirect('/login?next='+url); 
    }
});
module.exports = router;