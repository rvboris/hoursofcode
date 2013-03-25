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
        'jquery.simplePagination': 'libs/jquery.simplePagination',
        'jquery.scrollTo': '//cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/1.4.3/jquery.scrollTo.min'
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
        'jquery.scrollTo': {
            deps: ['jquery'],
            exports: 'jQuery.fn.scrollTo'
        },
        'handlebars': {
            deps: ['moment', 'moment.ru'],
            exports: 'handlebars',
            init: function (moment) {
                moment.lang('ru');

                Handlebars.registerHelper('moment', function (date, format) {
                    return moment(date, 'DD/MM/YYYY').format(format);
                });

                Handlebars.registerHelper('notLast', function (arr, index, options) {
                    if (_.indexOf(arr, index) === arr.length - 1) {
                        return options.inverse(this);
                    } else {
                        return options.fn(this);
                    }
                });

                Handlebars.registerHelper('getPostNameFromUrl', function (url) {
                    return _.compact(url.split('/'))[1];
                });

                Handlebars.registerHelper('getItemByIndex', function (arr, idx) {
                    return arr[idx] || false;
                });

                Handlebars.registerHelper('debug', function(optionalValue) {
                	try {
	                	console.log('Current Context');
	                	console.log(this);

	                	if (optionalValue) {
	                		console.log('Value');
	                		console.log(optionalValue);
	                	}
                	} catch (e) {

                	}
                });
            }
        }
    }
});

define(['jquery', 'lodash', 'registry', 'libs/director', 'blog', 'archive', 'hypercomments', 'libs/jquery.ascensor', 'jquery.slabText'], function ($, _, Registry, Router, Blog, Archive) {
    $(document).ready(function () {
        var router = null;
        var pageClass = $('body').attr('class').split(/\s+/)[0];
        var floors = 'blog | post | archive | portfolio | contact';

        var ascensor = $('#ascensorBuilding').ascensor({
            AscensorFloorName: floors,
            WindowsOn: floors.split(' | ').indexOf(pageClass) + 1,
            Direction: 'chocolate',
            ChildType: 'section',
            Easing: 'easeOutBounce',
            Time: 2000,
            AscensorMap: '1|2 & 1|3 & 2|1 & 2|2 & 2|3',
            FloorChange: function (floor) {
                if (router) {
                    router.setRoute('/' + floor);
                }
            },
            OnFloorChanged: function () {
                if ($('#fader').is(':visible')) {
                    $('#fader').fadeOut();
                }
            }
        }).data('ascensor');

        var blog, archive, portfolio, contact;

        var routes = {
            '/blog': {
	            'on': function () {
	            	$('.blog-section .container').scrollTo({ top: '0px', left: '0px' }, 500, { easing: 'swing', queue: true, axis:'y' });

	                var next = _.find(arguments, function (arg) {
	                    return _.isFunction(arg)
	                });

	                var handler = function () {
	                    if (_.size(arguments) > 1) {
	                        next();
	                    } else {
	                        blog.displayPosts(1, null, function () {
	                            next(false);
	                            ascensor.setFloorByHash('blog');
	                        });
	                    }
	                };

	                if (_.isUndefined(blog)) {
	                    blog = new Blog();
	                    blog.init().done(function () {
	                        handler.apply(this, arguments)
	                    });
	                    return;
	                }

	                handler.apply(this, arguments);
	            },
	            '/page': {
	            	'/:page': function (page, next) {
	            		blog.displayPosts(page, null, function () {
	            			ascensor.setFloorByHash('blog');
	            			next();
	            		});
	            	}
	            },
	            '/topic': {
	            	'/:topic': {
	            		on: function() {
	            			var next = _.find(arguments, function (arg) {
	            				return _.isFunction(arg)
	            			});

	            			if (_.size(arguments) > 2) {
	            				return next();
	            			}

	            			blog.displayPosts(1, arguments[0], function () {
	                    		ascensor.setFloorByHash('blog');
	                    		next();
	                		});
	            		},
	            		'/page': {
	            			'/:page': function(topic, page, next) {
	            				blog.displayPosts(page, topic, function () {
	                    			ascensor.setFloorByHash('blog');
	                    			next();
	                			});
	            			}
	            		}
	            	}
	            },
            },
            '/post': {
	            '/:name': function(name, next) {
		            var handler = function (result) {
		            	if (result) {
		                	ascensor.setFloorByHash('post');
		                } else {
		                	ascensor.setFloorByHash('blog');
		                }

		                next();
		            };

		            if (_.isUndefined(blog)) {
		            	blog = new Blog();
		                blog.init().done(function () {
		                	blog.displayPost('/posts/' + name, handler);
		               	});
		            } else {
		            	blog.displayPost('/posts/' + name, handler);
		            }
	            }
	        },
	        '/archive': function () {
	        	if (_.isUndefined(archive)) {
	        		archive = new Archive();
	        		archive.init().done(function() {
	        			archive.display();
	        			ascensor.setFloorByHash('archive');
	        		});
	        	} else {
	        		ascensor.setFloorByHash('archive');
	        	}
	        },
	        '/portfolio': function () {
	        	ascensor.setFloorByHash('portfolio');
	        },
	        '/contact': function () {
	        	ascensor.setFloorByHash('contact');
	        }
        };

	    router = Router(routes).configure({
	        recurse: 'forward',
	        async: true
	    }).init('/' + pageClass);

	    Registry.set('router', router);

	    if (window.location.hash && $('#fader').is(':visible')) {
	        $('#fader').fadeOut();
	    }

	    $('button.icon-chevron-up').on('click', function(e) {
	    	e.preventDefault();
	    	$(e.currentTarget).closest('.container').scrollTo({ top: '0px', left: '0px' }, 500, { easing: 'swing', queue: true, axis:'y' });
	    });
    });
});