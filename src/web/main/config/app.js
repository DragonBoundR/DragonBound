const express = require("express");
const setupMiddleware = require("@web/main/config/middleware");
const setupEngine = require("@web/main/config/engine");
const setupHttpServer = require("@web/main/config/httpServer");

const loggerFactory = require("@shared/logger");

const logger = loggerFactory.getLogger("DragonApp");

const setupApp = async () => {
  const app = express();

  logger.log("Setting up app");
  setupEngine(app);
  logger.log("Setting engine");
  setupMiddleware(app);
  logger.log("Setting middleware");
  setupHttpServer(app);
  logger.log("Setting HTTP server");
};

module.exports = setupApp;
