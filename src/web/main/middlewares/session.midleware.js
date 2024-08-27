const DataBase = require("../../../game/database");
const session = require("express-session");
const db = new DataBase();

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

module.exports = () =>
  session({
    key: "sessionid",
    secret: "abc-xgamedev",
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge: new Date(Date.now() + 100 * 1000 * 10),
    },
  });
