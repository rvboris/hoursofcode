define(['jquery', 'lodash'], function() {
	var Archive = function() {
		this.archiveData = null;
		this.archiveTemplate = Handlebars.compile($('#archive-template').html());
	};

	Archive.prototype.init = function() {
		var deferred = $.Deferred();

		if (!_.isNull(this.archiveData)) {
			deferred.resolveWith(this, [this]);
		} else {
			$.getJSON('/archive.json').done(_.bind(function(data) {
				this.archiveData = data;
				deferred.resolveWith(this, [this]);
			}, this));
		}
		
		return deferred.promise();
	};

	Archive.prototype.display = function() {
		$('.archive-section .content').html(this.archiveTemplate(this.archiveData));
	};

	return Archive;
})