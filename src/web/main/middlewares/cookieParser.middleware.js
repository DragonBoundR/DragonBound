const cookieParser = require("cookie-parser");
const config = require("@web/main/config/env");

module.exports = () => cookieParser(config.COOKIE.SECRET);
