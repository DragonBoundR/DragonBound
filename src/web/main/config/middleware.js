const bodyParser = require("../middlewares/bodyParser.middleware");
const controllers = require("../middlewares/controllers.middleware");
const cookieParser = require("../middlewares/cookieParser.middleware");
const database = require("../middlewares/database.middleware");
const json = require("../middlewares/json.middleware");
const publicResources = require("../middlewares/publicResources.middleware");
const session = require("../middlewares/session.midleware");

module.exports = (app) => {
  app.use(session());
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(database);
  app.use(json());
  publicResources(app)
  controllers(app)
};
