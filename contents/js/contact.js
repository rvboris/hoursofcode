define(['jquery', 'lodash'], function() {
	var Contact = function() {
		
	};

	Contact.prototype.init = function() {
		var deferred = $.Deferred();

		deferred.resolveWith(this, [this]);
		
		return deferred.promise();
	};

	return Contact;
});