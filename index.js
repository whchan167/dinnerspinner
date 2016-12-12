var express = require('express')
var app = express()

var Yelp = require('yelp');
var yelp = new Yelp({
	consumer_key: "ygFawGgchLPiVcFVWN8nKQ",
	consumer_secret: "kM5LMHLL_OLe2N9NeenSgQ2bpmg",
	token: "_L4v1t6kMsRuB92hhUNlI7xDCQdhH6Cz",
	token_secret: "G-kkHPcb5BRt60VdusOV7C8PCLE"
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/yelp/search', function (req, res) {
	yelp.search(req.query)
		.then(function (data) {
			res.setHeader('Access-Control-Allow-Origin',"*");
			res.json(data);
		})
		.catch(function (err) {
			console.log(err);
		});
})


app.listen(process.env.PORT || 5000, function () {
    console.log('example app listening on port 5000')
})
