const express  = require("express");
const router   = express.Router();

const restaurants   = require("../controllers/restaurants");

router.route("/restaurants")
  .get(restaurants.index)
  .post(restaurants.create);
router.route("/restaurants/:id")
  .get(restaurants.show)
  .put(restaurants.update)
  .delete(restaurants.delete);

module.exports = router;
