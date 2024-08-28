require("module-alias/register");

const setupApp = require("./config/app");

const logStarted = require("@web/main/config/logStarted");
const DragonDataBase = require("@infra/db/connection");
const Logger = require("@shared/logger");

const logger = Logger.getLogger("DragonServer");

(async function () {
  try {
    await DragonDataBase.init();
    logger.log("Database connected");
    await setupApp();
    logStarted();
  } catch (error) {
    logger.error("Error starting the application", error);
  }
})();
