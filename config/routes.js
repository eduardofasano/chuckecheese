const router = require('express').Router();
const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');
const jwt = require('jsonwebtoken');
const Twit = require('twit');

const users = require('../controllers/authController');
const secret = require('./tokens').secret;

const twitter = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

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

//TWITTER ROUTES
router.get('/tweets', (req, res) => {
  twitter.get('search/tweets', { q: req.query.q, count: 100 }, function(err, data, response) {
    res.json(data);
  });
});


//LOGIN & REGISTER ROUTES
router.route("/register")
  .post(authController.register);
router.route("/login")
  .post(authController.login);


module.exports = router;
