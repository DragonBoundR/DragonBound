var cls = require("./lib/class");
var Types = require("./gametypes");
var _ = require("underscore");
var Message = require("./lib/message");
var Logger = require('./lib/logger');
var db = require('./data');
var disconnected_handler = void 0;
var connected_handler = void 0;

function getClient(index) {
    return clients[index];
}

function secondsremaining(fechaFin) {
    var dif = Date.now() - fechaFin;
    var Segundos_de_T1_a_T2 = dif / 1000;
    var Segundos_entre_fechas = Math.abs(Segundos_de_T1_a_T2);
    return Segundos_entre_fechas;
}

function SetHandler(a, b) {
    if ("connected" == a) {
        connected_handler = b;
    } else if ("disconnected" == a) {
        disconnected_handler = b;
    } else if ("error" == a) {
        error_handler = b;
    } else if ("receive" == a) {
        receive_handlers = Object.freeze(b);
    }
}

function SendData(index, data) {
    console.log("send: " + JSON.stringify(data));
    getClient(index).sendUTF(JSON.stringify(data));
}

function SendDataAll(index, data, exp) {
    for (var i = 0; i < clients.length; i++) {
        if (exp != true) {
            SendData(i, data);
        } else if (i != index) {
            SendData(i, data);
        }
    }
}



module.exports.SetHandler = SetHandler;
