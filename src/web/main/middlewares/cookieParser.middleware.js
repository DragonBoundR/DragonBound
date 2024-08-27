var cookieParser = require("cookie-parser");

const SECRET = "xgamedev";

module.exports = () => cookieParser(SECRET);
