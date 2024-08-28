const Controller = require("@shared/lib/controller");

const handler = (req, res) => {
  res.json({
    armor: {
      health: 10,
      defense: 5,
      durability: 100,
    },
  });
};

module.exports = Controller.on(["/armor"], handler).setMethod("get");
