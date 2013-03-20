define([], function() {
	var GlobalRegistry = function() {
		this.data = [];
	};

	GlobalRegistry.prototype.get = function(idx) {
		return this.data[idx] || null;
	};

	GlobalRegistry.prototype.set = function(idx, val) {
		this.data[idx] = val;
	};

	return new GlobalRegistry();
});