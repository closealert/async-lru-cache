var ASLRUCache = require('./index.js'),http=require('http');
var cache = new ASLRUCache(1000);

function getIndex(host,cb) {

	if(cache.get(host,cb)) {
		console.log('Resolving %s from cache...',host);
		return true;
	}

	var options = {
		host: host,
		port: 80,
		path: '/',
		method: 'GET'
	};

	console.log('Looking up %s',host);
	var req = http.request(options, function(res) {
		var data = '';
		res.setEncoding('utf8');

		console.log('Status received for %s: %d',host,res.statusCode);

		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			console.log('Storing %s in cache...',host);
			cache.set(host,data);
		});
	});
	req.end();

}

getIndex('npmjs.org',function(res) {
	console.log('Body received for npmjs.org');
});
getIndex('npmjs.org',function(res) {
	console.log('Body received for npmjs.org');
});

getIndex('nodejs.org',function(res) {
	console.log('Body received for nodejs.org');
});
getIndex('nodejs.org',function(res) {
	console.log('Body received for nodejs.org');
});