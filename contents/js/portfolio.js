define(['jquery.isotope'], function() {
	var Portfolio = function() {
		$('.portfolio-section .skills li').each(_.bind(function(idx, element) {
			this.makeTransform(element);
		}, this)).jrumble().hover(_.bind(function(e) {
			$(e.currentTarget).trigger('startRumble');
		}, this), _.bind(function(e) {
			$(e.currentTarget).trigger('stopRumble');
			this.makeTransform(e.currentTarget);
		}, this));

		var isotopeElement = $('.portfolio-section .works-container').isotope({ itemSelector : 'li', layoutMode : 'fitRows' });

		$('.portfolio-section .filters button').on('click', function(e) {
			e.preventDefault();

			if ($(this).hasClass('active')) {
				return;
			}

			$('.portfolio-section .filters button.active').removeClass('active');

			$(this).addClass('active');

			isotopeElement.isotope({ filter: $(this).attr('data-filter') });
		});
	};

	Portfolio.prototype.makeTransform = function(element) {
		var rNum = (Math.random() * 4) - 2;

		$(element).css({
			'-webkit-transform': 'rotate(' + rNum + '2deg)',
			'-moz-transform': 'rotate(' + rNum + '2deg)',
			'-o-transform': 'rotate(' + rNum + '2deg)',
			'transform': 'rotate(' + rNum + '2deg)'
		});
	};

	return Portfolio;
});