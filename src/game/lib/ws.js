var Server = require("./server");
var SocketConnection = require("./socketconnection");

var http = require("http").createServer();
var express = require("express");
var cookieParser = require("cookie-parser");
var WebSocketServer = require("ws").Server;
var Logger = require("./logger");
const path = require("path");
var hbs = require("hbs");
var session = require("express-session");
var bodyParser = require("body-parser");
const DataBase = require("../database");

// WS
var db = new DataBase();
var options = {
  host: db.host,
  port: 3306,
  user: db.user,
  password: db.password,
  database: db.database,
  schema: {
    tableName: "account_sessions",
    columnNames: {
      session_id: "session_id",
      expires: "expires_time",
      data: "data_acc",
    },
  },
};

module.exports = class WS extends Server {
  constructor(port) {
    super(port);

    var self = this;
    this.db = db;
    this._counter = 0;
    var MySQLStore = require("express-mysql-session")(session);
    var sessionStore = new MySQLStore(options);
    this._httpServer = http;
    this._app = express();

    // Configuración de HBS
    this._app.set("view engine", "hbs");
    this._app.set("views", path.join(__dirname, "../../web/views"));
    this._app.use(
      session({
        key: "sessionid",
        secret: "abc-xgamedev",
        store: sessionStore,
        resave: true,
        saveUninitialized: true,
        cookie: {
          secure: true,
          maxAge: 100 * 1000 * 10,
        },
      })
    ); // middleware - OK
    hbs.registerPartials(path.join(__dirname, "../../web/views/partials"));

    // Middleware
    this._app.use(cookieParser("xgamedev"));
    this._app.use(bodyParser.urlencoded({ extended: false }));
    this._app.use(bodyParser.json());
    this._app.use(function (req, res, next) {
      req.db = db;
      try {
        next();
      } catch (e) {
        Logger.debug("err: " + e.stack);
        res.status(403);
      }
    });
    this._app.use(
      "/static",
      express.static(path.join(__dirname, "../../web/public_html/data"))
    );
    this._app.use(require("../../web/controllers"));

    // HTTP Server
    this._httpServer.on("request", this._app);
    this._httpServer.listen(port, function () {
      var st = process.env.vps == "1" ? "VPS" : "LOCAL";
      st = process.env.vps == "3" ? "LINUX" : st;
      Logger.normal("Listening on " + st + " " + http.address().port);
    });

    // WebSocket
    this._wss = new WebSocketServer({ server: http });
    this._wss.on("connection", function connection(ws, req) {
      self.server_qid = parseInt(req.url.split("/")[1]);
      var c = new SocketConnection(self._createId(), ws, self);
      if (self.connection_callback) {
        self.connection_callback(c);
      }
      self.addConnection(c);
    });
  }

  _createId() {
    return "5" + Math.floor(Math.random() * 99) + "" + this._counter++;
  }
};
