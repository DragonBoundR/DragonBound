const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.WEB_PORT || 80,
};
