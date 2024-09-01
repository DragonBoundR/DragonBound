const { BULLET_ID } = require("./consts/bullets.const");

class ArmorS1 {
  id = BULLET_ID.ARMOR1;
  img = 0;
  size = {
    w: 10,
    h: 10,
  };
  type = "TEST";
  detail = {
    damage: 10,
    regeneration: 10,
  };
  on_shot = [];
}
