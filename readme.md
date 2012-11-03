async-lru-cache
===============

AsyncLRUCache is an async cache that makes it a bit easier to use caching in nodejs. It works by taking a callback argument and queueing these callbacks while your function is performing the IO to get the value.

For now I've only built it for callbacks with one argument.

Setup
-------

```javascript
var ASLRUCache = require('./index.js'),http=require('http');
var cache = new ASLRUCache(1000); // Create a new cache with max 1.000 items

function doSomeIOStuff(inputVal, cb) {

	// Add this to make the function cacheble
	// If we're already doing IO for this key or it's already in cache, the function will stop here.
	if(cache.get(inputVal,cb)) {
		console.log('Resolving %s from cache...',inputVal);
		return true;
	}

	// Your IO logic goes right below that
	ioFunction(inputVal,function(outputVal) {
		cache.set(inputVal,outputVal); // The cache will now execute any parked cbs.
	});
}

```