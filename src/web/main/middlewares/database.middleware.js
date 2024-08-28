const DragonDataBase = require("@infra/db/connection");

module.exports = (req, res, next) => {
  req.db = DragonDataBase.connection;

  try {
    next();
  } catch (ex) {
    console.log(ex);
    res.status(403);
  }
};
