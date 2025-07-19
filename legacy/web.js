var fs = require("fs");
var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var exphbs = require("express-handlebars");
// var Logger = require('./game/lib/logger');
var Logger = require("../../game/lib/logger");
var DataBase = require("../../game/database");
var session = require("express-session");
// var { exec } = require("child_process");

const config = require("./config/env");

var hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "/web/views/layouts"),
  partialsDir: ["/web/views/partials/"],
});

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
var MySQLStore = require("express-mysql-session")(session);
var sessionStore = new MySQLStore(options);
var http = require("http").createServer();
this._httpServer = http;
this._app = express(); // Initialize Express app
this._app.engine("handlebars", hbs.engine);
this._app.set("view engine", "handlebars");
this._app.set("views", path.join(__dirname, "/web/views"));
this._app.use(
  session({
    key: "sessionid",
    secret: "abc-xgamedev",
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge:  100 * 1000 * 10,
    },
  })
); // middleware - OK
this._app.use(cookieParser("xgamedev")); // middleware - OK
this._app.use(bodyParser.urlencoded({ extended: false })); // middleware - OK
this.pin_code = [];
this._app.use(function (req, res, next) {
  req.db = db;
  try {
    next();
  } catch (e) {
    Logger.debug("err: " + e.stack);
    res.status(403);
  }
}); // middleware - OK

this._app.use(bodyParser.json()); // middleware - OK
this._app.use(
  "/static",
  express.static(path.join(__dirname + "/web/public_html/data"))
); // middleware - OK

this._app.use(require("../../web/controllers")); // middleware - OK

http.on("request", this._app);

http.listen(config.PORT, function () {
  var st = process.env.vps == "1" ? "VPS" : "LOCAL";
  Logger.normal("Listening on " + st + " " + http.address().port);
});