const DataBase = require("../../../game/database");

module.exports = (req, res, next) => {
  var db = new DataBase();
  req.db = db;

  try {
    next();
  } catch (ex) {
    console.log(ex);
    res.status(403);
  }
};
