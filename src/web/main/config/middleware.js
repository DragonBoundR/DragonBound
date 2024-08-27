const bodyParser = require("@web/main/middlewares/bodyParser.middleware");
const controllers = require("@web/main/middlewares/controllers.middleware");
const cookieParser = require("@web/main/middlewares/cookieParser.middleware");
const database = require("@web/main/middlewares/database.middleware");
const json = require("@web/main/middlewares/json.middleware");
const publicResources = require("@web/main/middlewares/publicResources.middleware");
const session = require("@web/main/middlewares/session.midleware");

module.exports = (app) => {
  app.use(session());
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(database);
  app.use(json());
  publicResources(app)
  controllers(app)
};
