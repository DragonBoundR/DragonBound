const session = require("express-session");
const expressMysqlSession = require("express-mysql-session");

const config = require("@web/main/config/env");

var options = {
  host: config.DB.HOST,
  port: config.DB.PORT,
  user: config.DB.USER,
  password: config.DB.PASSWORD,
  database: config.DB.DATABASE,
  schema: {
    tableName: "account_sessions",
    columnNames: {
      session_id: "session_id",
      expires: "expires_time",
      data: "data_acc",
    },
  },
};

var MySQLStore = expressMysqlSession(session);
var sessionStore = new MySQLStore(options);

module.exports = () =>
  session({
    key: "sessionid",
    secret: config.SESSION.SECRET,
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge: 100 * 1000 * 10,
    },
  });
