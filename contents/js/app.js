requirejs.config({
	paths: {
		'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min',
		'lodash': '//cdnjs.cloudflare.com/ajax/libs/lodash.js/1.0.1/lodash.min',
		'handlebars': '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.0.0-rc.3/handlebars.min',
		'moment': '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.0.0/moment.min',
		'moment.ru': '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.0.0/lang/ru',
		'hypercomments': '//static.hypercomments.com/widget/hcembed/6177/ru/201303201559/1/widget',
		'jquery.easing': '//cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min',
		'jquery.slabText': '//cdnjs.cloudflare.com/ajax/libs/slabText/2.2/jquery.slabtext.min',
		'jquery.simplePagination': 'libs/jquery.simplePagination'
	},
	shim: {
		'jquery.easing': {
			deps: ['jquery'],
			exports: 'jQuery.easing'
		},
		'jquery.slabText': {
			deps: ['jquery'],
			exports: 'jQuery.fn.slabText'
		},
		'jquery.simplePagination': {
			deps: ['jquery'],
			exports: 'jQuery.fn.pagination'
		},
		'handlebars': {
			deps: ['moment', 'moment.ru'],
			exports: 'handlebars',
			init: function(moment) {
				moment.lang('ru');

				Handlebars.registerHelper('moment', function(date, format) {
					return moment(date, 'DD/MM/YYYY').format(format);
				});

				Handlebars.registerHelper('notLast', function(arr, index, options) {
					if (_.indexOf(arr, index) === arr.length - 1) {
						return options.inverse(this);
					} else {
						return options.fn(this);
					}
				});
			}
		}
	}
});

define(['jquery', 'lodash', 'registry', 'libs/director', 'blog', 'hypercomments', 'libs/jquery.ascensor', 'jquery.slabText'], function($, _, Registry, Router, Blog) {
	$(document).ready(function() {
		var router = null;
		var pageClass = $('body').attr('class').split(/\s+/)[0];
		var floors = 'blog | page | portfolio | contact';

		var ascensor = $('#ascensorBuilding').ascensor({
	        AscensorFloorName: floors,
	        WindowsOn: floors.split(' | ').indexOf(pageClass) + 1,
	        Direction: 'chocolate',
	        ChildType: 'section',
	        Easing: 'easeOutBounce',
	        Time: 2000,
	        AscensorMap: '1|1 & 1|2 & 2|1 & 2|2',
	        FloorChange: function(floor) {
	        	if (router) {
	        		router.setRoute('/' + floor);
	        	}
	        },
	        OnFloorChanged: function() {
	        	if ($('#fader').is(':visible')) {
	        		$('#fader').fadeOut();
	        	}
	        }
	    }).data('ascensor');

	    var blog, page, portfolio, contact;

	    var routes = {
	    	'/blog': {
	    		'/page/:num': function(pageNum, next) {
	    			blog.displayPosts(pageNum, _.bind(function() {
	    				next();
	    			}, this));
	    		},
	    		'/tag/:tag': {
	    			'/page/:num': function() {

	    			},
	    			on: function() {

	    			}
	    		},
	    		'on': function(pageNum, next) {
	    			if (!_.isUndefined(blog)) {
	    				ascensor.setFloorByHash('blog');
	    				return next();
	    			}

	    			blog = new Blog();

	    			blog.init().done(function() {
	    				ascensor.setFloorByHash('blog');
	    				next();
	    			});
	    		}
	    	},
	    	'/page': {
	    		'/:name': function(postName, next) {
	    			blog.displayPost('/posts/' + postName + '/', function(result) {
			    		if (result) {
			    			ascensor.setFloorByHash('page');
			    		} else {
			    			ascensor.setFloorByHash('blog');
			    		}

			    		next();
		    		});
	    		},
	    		on: function(postName, next) {
	    			if (!_.isUndefined(blog)) {
	    				return next();
	    			}

	    			blog = new Blog();
	    			blog.init().done(next);
	    		}
	    	},
	    	'/portfolio': function() {
	    		ascensor.setFloorByHash('portfolio');
	    	},
	    	'/contact': function() {
	    		ascensor.setFloorByHash('contact');
	    	}
	    };

	    router = Router(routes).configure({ recurse: 'forward', async: true }).init('/' + pageClass);

	    Registry.set('router', router);

	    if (window.location.hash && $('#fader').is(':visible')) {
	    	$('#fader').fadeOut();
	    }
	});
});