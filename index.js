/**
 * AsyncLRUCache is an async cache that makes it a bit easier to use
 * caching in nodejs. It works by taking a callback argument and
 * queueing these callbacks while your function is performing the IO
 * to get the value.
 *
 * Once you call cache.set() it will execute all the callbacks
 * you've given the function.
 */
var LRU = require('lru-cache');
module.exports = function AsyncLRUCache(items) {

	/**
	 * @var LRUCache The actual cache (didn't feel like writing that...)
	 */
	this.cache = LRU(items);

	/**
	 * Returns the items in the current cache
	 * @return int Item count
	 */
	AsyncLRUCache.prototype.itemCount = function() {
		return this.cache.itemCount;
	}

	/**
	 * Lookup an item and attach a callback if the item is not found
	 *
	 * @param string Cache key
	 * @param function Callback function which is called after set(key) is called.
	 * @return bool Whether the value is found
	 */
	AsyncLRUCache.prototype.get = function(key,cb) {

		key = new String(key);

		var val = this.cache.get(key);

		// Value found :-)
		if(val) {
			// Oh but it's still doing io :-(, ill just queue myself here..
			if((typeof(val) == 'object') && ('asc__cb' in val)) {
				val.asc__cb.push(cb);
				this.cache.set(key,val);
				return true;
			}
			// Yess! Caaaalbaaaaack w00t
			else {
				cb(val);
				return true;
			}
		}
		// Value not found
		else {
			val = {asc__cb:[cb]};
			this.cache.set(key,val);
			return false;
		}
	}

	/**
	 * Set a cache value and If any callbacks were attached, execute them
	 *
	 * @param string Cache key
	 * @param mixed Value to be cached
	 */
	AsyncLRUCache.prototype.set = function(key,_val) {

		key = new String(key);

		var val = {},
			currentVal = this.cache.get(key);

		// Copy the input value
		switch(typeof _val){
			case 'object':
				val = Object.create(_val);
			break;
			case 'array':
				val = _val.slice(0);
			break;
			case 'number':
				val = 0 + _val;
			break;
			case 'string':
				val = ''+_val;
			break;
		}

		this.cache.set(key,val);

		if(currentVal) {
			if((typeof(currentVal) == 'object') && ('asc__cb' in currentVal)) {
				for(i=0;i<currentVal.asc__cb.length; i++) {
					currentVal.asc__cb[i](val);
				}
			}
		}
	}
}