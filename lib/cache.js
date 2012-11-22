/**
 * AsyncLRUCache is an async cache that makes it a bit easier to use
 * caching in nodejs. It works by taking a callback argument and
 * queueing these callbacks while your function is performing the IO
 * to get the value.
 *
 * Once you call cache.set() it will execute all the callbacks
 * you've given the function.
 */
var LRUCache = require('lru-cache');

module.exports = function AsyncLRUCache(options) {

	/**
	 * @var LRUCache The actual cache (didn't feel like writing that...)
	 */
	this.cache = LRUCache(options);

	Object.defineProperty(this,'length',{
		get: function() {
			return this.cache.length;
		},
		enumerable: true
	});

	Object.defineProperty(this,'itemCount',{
		get: function() {
			return this.cache.itemCount;
		},
		enumerable: true
	});

	AsyncLRUCache.prototype.has = function(key) {
		return this.cache.has(key);
	};

	AsyncLRUCache.prototype.del = function(key) {
		return this.cache.del(key);
	};

	AsyncLRUCache.prototype.dump = function() {
		return this.cache.dump();
	};


	AsyncLRUCache.prototype.reset = function() {
		return this.cache.reset();
	};

	/**
	 * Lookup an item and attach a callback if the item is not found
	 *
	 * @param string Cache key
	 * @param function Callback function which is called after set(key) is called.
	 * @return bool Whether the value is found
	 */
	AsyncLRUCache.prototype.get = function(key,callback) {

		var val = this.cache.get(key);

		if(val) {
			// Pending callbacks
			if((typeof(val) == 'object') && ('__alc_cb_p' in val)) {
				val.__alc_cb_p.push(callback);
				this.cache.set(key,val);
				return true;
			}
			// Values array
			else if((typeof(val) == 'object') && ('__alc_cb_v' in val) && ('__alc_cb_c' in val)) {
				callback.apply(val.__alc_cb_c,val.__alc_cb_v);
				return true;
			}
		}
		// Value not found
		else {
			val = {__alc_cb_p:[callback]};
			this.cache.set(key,val);
			return false;
		}
	};

	/**
	 * Set a cache value and If any callbacks were attached, execute them
	 *
	 * @param string Cache key
	 * @param[...] Arguments for the callback
	 */
	AsyncLRUCache.prototype.set = function() {

		var args	= Array.prototype.slice.call(arguments, 0),
			key		= args.splice(0,1),
			_cval	= this.cache.get(key);

		this.cache.set(key,{__alc_cb_v:args,__alc_cb_c:null});

		if(_cval) {
			if((typeof(_cval) == 'object') && ('__alc_cb_p' in _cval)) {
				for(i=0;i<_cval.__alc_cb_p.length; i++) {
					_cval.__alc_cb_p[i].apply(null,args);
				}
			}
		}
	};

	/**
	 * Set a cache value and If any callbacks were attached, execute them
	 *
	 * @param string Cache key
	 * @param Object Context
	 * @param[...] Arguments for the callback
	 */
	AsyncLRUCache.prototype.setContextual = function() {

		var args	= Array.prototype.slice.call(arguments, 0),
			key		= args.splice(0,1),
			context	= args.splice(0,1),
			_cval	= this.cache.get(key);

		this.cache.set(key,{__alc_cb_v:args,__alc_cb_c:context});

		if(_cval) {
			if((typeof(_cval) == 'object') && ('__alc_cb_p' in _cval)) {
				for(i=0;i<_cval.__alc_cb_p.length; i++) {
					_cval.__alc_cb_p[i].apply(context,args);
				}
			}
		}
	};
};