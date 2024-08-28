const loggerFactory = require("@shared/logger");

const logger = loggerFactory.getLogger("DragonRouter");

module.exports = (app, controllers) => {
  controllers.forEach((controller) => {

    controller.route.forEach((route) => {
      logger.log(`Loaded controller [${controller.method.toUpperCase()}] ${route}`);
      app[controller.method](route, ...controller.middlewares, controller.handler);
    });
  });
}