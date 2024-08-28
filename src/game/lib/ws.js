
var Server = require('./server');
var SocketConnection = require('./socketconnection');

var http = require('http').createServer();
var express = require('express');
var cookieParser = require('cookie-parser');
var WebSocketServer = require('ws').Server;
var Logger = require('./logger');

// WS
module.exports = class WS extends Server {
    constructor(port) {
        super(port);
        var self = this;
        this.db = null;
        this._counter = 0;
        this._httpServer = http;
        this._app = express();
        this._app.set('env', 'production');
        this._app.disable('x-powered-by');
        this._app.use(cookieParser('xgamedev'));
        this._app.use("/", function(req, res) {
            res.send("hi");
        });
        this._httpServer.on('request', this._app);
        this._httpServer.listen(port, function() {
            var st = process.env.vps == '1' ? 'VPS' : 'LOCAL';
            st = process.env.vps == '3' ? 'LINUX' : st;
            Logger.normal('Listening on ' + st + " " + http.address().port);
        });
        this._wss = new WebSocketServer({
            server: http
        });
        this._wss.on('connection', function connection(ws,req) {
            self.server_qid=parseInt(req.url.split("/")[1]);
            var c = new SocketConnection(self._createId(), ws, self);
            if (self.connection_callback) {
                self.connection_callback(c);
            }
            self.addConnection(c);
        });
    }
    
    _createId() {
        return '5' + Math.floor(Math.random() * 99) + '' + (this._counter++);
    }
};