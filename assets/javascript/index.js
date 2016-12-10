var express = require('express')
var app = express()

var Yelp = require('yelp');
var yelp = new Yelp({
	consumer_key: "QX6AnsA4NRlYlCLUVFziIw",
	consumer_secret: "Rr8vgooT0PXeq_0H4bXFppd_nsY",
	token: "ZT3pl3vqniQ_Q8V40yf07l5FXRxY-fQt",
	token_secret: "o1gvIqxMeJx0gXQrzNkkleOKEKE"
});

app.get('/', function (req, res) {
	res.send('hello world');
})

app.get('/yelp/search', function (req, res) {
	yelp.search(req.query)
		.then(function (data) {
			res.json(data);
		})
		.catch(function (err) {
			console.log(err);
		});
})


app.listen(5000, function () {
	console.log('example app listening on port ', app.get('port'))
})