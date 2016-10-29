const router = require('express').Router();
const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');
const jwt = require('jsonwebtoken');

const users = require('../controllers/authController');
const secret = require('./tokens').secret;

function secureRoute(req, res, next) {
  if(!req.headers.authorization) return res.status(401).json({ message: "Unauthorized!"});

  let token = req.headers.authorization.replace("Bearer ", '');
  jwt.verify(token, secret, (err, payload) => {
    if(err) return res.status(401).json({ message: "Unauthorized"});

    req.user = payload;
    next();
  });

}

//USER ROUTES
router.route('/users')
  .all(secureRoute)
  .get(usersController.index);
router.route('/users/:id')
  .all(secureRoute)
  .get(usersController.show)
  .put(usersController.update)
  .delete(usersController.delete);

//LOGIN & REGISTER ROUTES
router.route("/register")
  .post(authController.register);
router.route("/login")
  .post(authController.login);


module.exports = router;
