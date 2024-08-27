const loggerFactory = require("@shared/logger");

const logger = loggerFactory.getLogger("DragonServer");
const config = require("@web/main/config/env");

module.exports = () => {
  logger.break();
  logger.green("Compiled successfully!");
  logger.break();
  logger.white("The app is running at:");
  logger.break();
  logger.cyan(`  http://localhost:${config.PORT}`);
  logger.break();
  logger.white("Note that the development build is not optimized.");
  logger.customColor(
    ["white", "cyan", "white"],
    "To create a production build, use ",
    "npm run build",
    "."
  );
};
