const bodyParser = require("@web/main/middlewares/bodyParser.middleware");
const cookieParser = require("@web/main/middlewares/cookieParser.middleware");
const database = require("@web/main/middlewares/database.middleware");
const json = require("@web/main/middlewares/json.middleware");
const publicResources = require("@web/main/middlewares/publicResources.middleware");
const session = require("@web/main/middlewares/session.midleware");
const morgan = require("@web/main/middlewares/morgan.middleware");

module.exports = (app) => {
  app.use(morgan());
  app.use(session());
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(database);
  app.use(json());
  publicResources(app)
};
