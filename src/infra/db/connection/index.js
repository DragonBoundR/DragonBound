const DataBase = require("@game/database");

class DragonDataBase {
  connection = null;

  async init() {
    if (!this.connection) {
      this.connection = await DataBase.init();
    }
    return this.connection;
  }
}
module.exports = new DragonDataBase();
