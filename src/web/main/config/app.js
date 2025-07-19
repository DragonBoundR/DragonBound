const express = require("express");
const setupMiddleware = require("@web/main/config/middleware");
const setupEngine = require("@web/main/config/engine");
const setupHttpServer = require("@web/main/config/httpServer");
const setupControllers = require("@web/main/config/controllers");
const setupRouter = require("@web/main/config/router");
const setupLegacyControllers = require("@web/main/config/legacyControllers");
const loggerFactory = require("@shared/logger");

const logger = loggerFactory.getLogger("DragonApp");

const setupApp = () => {
  const app = express();

  logger.log("Setting up app");
  // const controllers = await setupControllers();
  logger.log("Setting controllers")
  setupEngine(app);
  logger.log("Setting engine");
  setupMiddleware(app);
  logger.log("Setting middleware");
  // setupRouter(app, controllers);
  logger.log("Setting router");
  setupLegacyControllers(app);
  logger.log("Setting legacy controllers");
  setupHttpServer(app);
  logger.log("Setting HTTP server");

  return app
};

module.exports = setupApp;
