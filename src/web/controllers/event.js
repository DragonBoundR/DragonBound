var express = require('express'),
router = express.Router();
var mysql = require('mysql');
var Logger = require('../../game/lib/logger');
var constants = require('constants');

function getRandomItem(arr) {

    // get random index value
    const randomIndex = Math.floor(Math.random() * arr.length);

    // get random item
    const item = arr[randomIndex];

    return item;
}

router.get('/', function (req, res) {
    if (req.session.account_id) {
        req.session.touch();
        var user_id = req.session.account_id;
        var nick = req.session.game_id;
        req.db.getUserByIdAcc(user_id)
            .then(function (rows2) {
            var res1 = rows2[0][0];
            var nivel = res1.rank;
            //Logger.info("event participando "+nick +" rank "+ nivel);
            if(nivel === '26' ||nivel === '27' ||nivel === '28' ||nivel === '29' || nivel === '30' || nivel === '31'){
                var estado ="msjprev";
                res.render('event',{
                    nick : nick,
                    estado: estado
                });
            }else{
                var estado ="inicio";
                res.render('event',{
                    nick : nick,
                    estado: estado
                });
            }
        })
    }else{
        /*var estado ="msjprev"; //desactivado
        res.render('event',{
            estado: estado
        });*/
        var url = req.baseUrl;
        res.redirect('/login?next='+url);
    }
});
router.post('/', function (req, res) {
    if (req.session.account_id) {
        req.session.touch();
        var user_id = req.session.account_id;
        var nick = req.session.game_id;
        var gift = req.body.SAVE;
        var estado ="msjprev";
        
        if (gift === 'PREMIO') {
            //Logger.info("event recogido");
			const array = [40485, 8269, 4025, 8268];
			const event_gift = getRandomItem(array);
                    req.db.getBoy(parseInt(user_id), parseInt(event_gift)).then(function (acc) {}).catch(function (err) {
						let datasendgift = {
						    UserId: req.session.account_id,
						    aId: event_gift,
						    type: 0,
						    expire_time: 0,
							is_cash: 0,
							is_gift: 1,
							gift_sent_by: req.session.account_id,
							amount: 0,
							date_ava_time: Date.now()
						};
						req.db.putUserAvatars(datasendgift)
                        //Logger.info("nivel entregado");
                    });
                            res.render('event',{
                                nick : nick,
                                estado: estado,
                                user_id: user_id
                            });
        }
    } else {
        //res.send("error login :(")
        var url = req.baseUrl;
        res.redirect('/login?next='+url);
    }
});
module.exports = router;