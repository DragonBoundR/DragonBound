const Controller = require("@shared/lib/controller");

const handler = (req, res) => {
  res.send("Hello World!");
};

module.exports = Controller.on([
  "/test",
  "/test2",
], handler)
.setMethod("get")
