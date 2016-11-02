const Twitter = require('twitter-node-client').Twitter;

const twitter = new Twitter({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


function indexTweets (req, res) {
  let error = function (err, response, body) {
    console.log(err);
  };

  let success = function (data) {
    let tweets = JSON.parse(data);
    console.log('Data [%s]', data);
    res.json(tweets);
  };
  twitter.getSearch({'q': req.query.q, 'count': 10}, error, success);
// twitter.get('search/tweets', { q: req.query.q, count: 100 }, function(err, data, response) {
// res.json(data);
// });
}

module.exports = {
  index: indexTweets
};
