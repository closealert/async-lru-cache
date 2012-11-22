async-lru-cache
===============

AsyncLRUCache is an async cache that makes it a bit easier to use caching in nodejs. It works by taking a callback argument and queueing these callbacks while your function is performing the IO to get the value.

Callbacks can take any number of aruments and with `setContext` you can also specify the context that has to be applied to the callback (as second argument)

For any details as to how it works, look into lib/cache.js or example.js (also shown below).

```javascript
var Cache		= require('./lib/cache.js'),
	http		= require('http'),
	hostCache	= new Cache(1000),
	stszCache	= new Cache(1000);


/**
 * Function with single argument callback
 * Connects to a host and returns true or false wether a connection was made
 *
 * @param key Hostname
 * @param Function Callback
 */
function checkHost(host,callback) {

	if(hostCache.get(host,callback)) {
		console.log('checkHost: Resolved %s from hostCache...',host);
		return true;
	}

	console.log('checkHost: Looking up %s...',host);

	var options = {
		host: host,
		port: 80,
		path: '/',
		method: 'GET'
	};

	var req = http.request(options, function(res) {
		var data = '';
		res.setEncoding('utf8');

		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			hostCache.set(host,true);
		});
		res.on('error',function() {
			hostCache.set(host,false);
		});
	});
	req.on('error',function() {
		hostCache.set(host,false);
	});
	req.end();
}

/**
 * Function with multiple argument callback
 * Downloads a page, and returns three args:
 * @return mixed Error or null
 * @return int Status code
 * @return int Size
 *
 * @param key Hostname
 * @param Function Callback
 */
 function getStatusAndSize(host,path,callback) {

	if(stszCache.get(host,callback)) {
		console.log('getStatusAndSize: Resolved %s%s from stszCache...',host,path);
		return true;
	}

	console.log('getStatusAndSize: Looking up %s%s...',host,path);

	var options = {
		host: host,
		port: 80,
		path: path,
		method: 'GET'
	};

	var req = http.request(options, function(res) {
		var data = '';
		res.setEncoding('utf8');

		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			stszCache.set(host,null,res.statusCode,data.length);
		});
		res.on('error', function (e) {
			stszCache.set(host,e);
		});
	});
	req.on('error',function(e) {
		stszCache.set(host,e);
	});
	req.end();
}

// The first ones

console.log('\nFirst calls...\n');

checkHost('google.com',function(status) {
	console.log('google.com returned %s',(status ? 'ok' : 'error'));
});

checkHost('google978345789345978.com',function(status) {
	console.log('google978345789345978.com returned %s',(status ? 'ok' : 'error'));
});

getStatusAndSize('nodejs.org','/about',function(err,status,size) {
	if(!err)
		console.log('nodejs.org/ returned %d and has length %d',status,size);
	else
		console.error('nodejs.org/ returned the following error: %s',err);
});

getStatusAndSize('nnnnnpmjs.org','/about',function(err,status,size) {
	if(!err)
		console.log('nnnnnpmjs.org/about returned %d and has length %d',status,size);
	else
		console.error('nnnnnpmjs.org/about returned the following error: %s',err);
});

// The ones that will be queued

console.log('\nCalls that will be queued...\n');

checkHost('google.com',function(status) {
	console.log('google.com returned %s',(status ? 'ok' : 'error'));
});

checkHost('google978345789345978.com',function(status) {
	console.log('google978345789345978.com returned %s',(status ? 'ok' : 'error'));
});

getStatusAndSize('nodejs.org','/about',function(err,status,size) {
	if(!err)
		console.log('nodejs.org/ returned %d and has length %d',status,size);
	else
		console.error('nodejs.org/ returned the following error: %s',err);
});

getStatusAndSize('nnnnnpmjs.org','/about',function(err,status,size) {
	if(!err)
		console.log('nnnnnpmjs.org/about returned %d and has length %d',status,size);
	else
		console.error('nnnnnpmjs.org/about returned the following error: %s',err);
});

// The ones that will hit cache directly

setTimeout(function() {

console.log('\nCalls that will hit cache...\n');

checkHost('google.com',function(status) {
	console.log('google.com returned %s',(status ? 'ok' : 'error'));
});

checkHost('google978345789345978.com',function(status) {
	console.log('google978345789345978.com returned %s',(status ? 'ok' : 'error'));
});

getStatusAndSize('nodejs.org','/about',function(err,status,size) {
	if(!err)
		console.log('nodejs.org/ returned %d and has length %d',status,size);
	else
		console.error('nodejs.org/ returned the following error: %s',err);
});

getStatusAndSize('nnnnnpmjs.org','/about',function(err,status,size) {
	if(!err)
		console.log('nnnnnpmjs.org/about returned %d and has length %d',status,size);
	else
		console.error('nnnnnpmjs.org/about returned the following error: %s',err);
});

},5000);
```