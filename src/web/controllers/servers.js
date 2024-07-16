
var express = require('express'),
    router = express.Router();

var mysql = require('mysql');
var Logger = require('../../game/lib/logger');
var ignoreCase = require('ignore-case');
var md5 = require('md5');
var constants = require('constants');

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var data = [94, 0, 0, 
        ["High Ranks", 0, 8000, 190, 3000, 9, 24],
		["Mid Ranks", 1, 9011, 1681, 3000, 7, 17],
		["Beginners", 2, 9012, 1619, 5000, 0, 6],
        ["Bunge",3,9014,8,9013,0,24,1566770400000,1566777600000],
    
        1566710576729
    ];
    req.session.touch();
    res.send(JSON.stringify(data));
});

module.exports = router;