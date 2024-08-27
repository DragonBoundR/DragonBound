const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.WEB_PORT || 80,
  COOKIE: {
    SECRET: process.env.COOKIE_SECRET || "cookie-secret-xxx",
  },
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "",
    DATABASE: process.env.DB_DATABASE || "database-name-xxx",
    PORT: process.env.DB_PORT || 3306,
  },
  SESSION: {
    SECRET: process.env.SESSION_SECRET || "xxx",
  },
};
