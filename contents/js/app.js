requirejs.config({
    paths: {
        'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min',
        'lodash': '//cdnjs.cloudflare.com/ajax/libs/lodash.js/1.0.1/lodash.min',
        'crossroads': '//cdnjs.cloudflare.com/ajax/libs/crossroads/0.11.0/crossroads.min',
        'signals': '//cdnjs.cloudflare.com/ajax/libs/js-signals/0.8.1/js-signals.min',
        'handlebars': '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.0.0-rc.3/handlebars.min',
        'moment': '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.0.0/moment.min',
        'moment.ru': '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.0.0/lang/ru',
        'hypercomments': '//static.hypercomments.com/widget/hcembed/6177/ru/201303201559/1/widget',
        'jquery.easing': '//cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min',
        'jquery.slabText': '//cdnjs.cloudflare.com/ajax/libs/slabText/2.2/jquery.slabtext.min',
        'jquery.simplePagination': 'libs/jquery.simplePagination',
        'jquery.jrumble': 'libs/jquery.jrumble',
        'jquery.scrollTo': '//cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/1.4.3/jquery.scrollTo.min',
        'jquery.isotope': '//cdnjs.cloudflare.com/ajax/libs/jquery.isotope/1.5.25/jquery.isotope.min',
        'jquery.fancybox': '//cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.4/jquery.fancybox.pack'
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
        'jquery.isotope': {
            deps: ['jquery'],
            exports: 'jQuery.fn.isotope'
        },
        'jquery.jrumble': {
            deps: ['jquery'],
            exports: 'jQuery.fn.jrumble'
        },
        'jquery.fancybox': {
            deps: ['jquery'],
            exports: 'jQuery.fn.fancybox'
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

define(['jquery', 'lodash', 'libs/hasher', 'crossroads', 'blog', 'archive', 'portfolio', 'hypercomments', 'libs/jquery.ascensor', 'jquery.slabText', 'jquery.jrumble'], function ($, _, hasher, crossroads, Blog, Archive, Portfolio) {
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
            	hasher.setHash(floor);
            },
            OnFloorChanged: function () {
                if ($('#fader').is(':visible')) {
                    $('#fader').fadeOut();
                }
            }
        }).data('ascensor');

        var pageInstances = {};

        var getPage = function(name) {
        	var getFunction = function(name) {
        		return eval(name.charAt(0).toUpperCase() + name.slice(1))
        	};

        	var Func = getFunction(name);

        	if (_.isUndefined(pageInstances[name])) {
        		pageInstances[name] = new Func();
        	}

        	return pageInstances[name].init();
        };

        crossroads.addRoute('/blog', function() {
        	getPage('blog').done(function(blog) {
				blog.displayPosts(1, null, function () {
        			ascensor.setFloorByHash('blog');
        		});
			});
        });

        crossroads.addRoute('/blog/page/{page}', function(page) {
        	getPage('blog').done(function(blog) {
				blog.displayPosts(page, null, function () {
	            	ascensor.setFloorByHash('blog');
	            });
			});
        });

        crossroads.addRoute('/blog/topic/{topic}', function(topic) {
			getPage('blog').done(function(blog) {
				blog.displayPosts(1, topic, function () {
	                ascensor.setFloorByHash('blog');
	            });
			});
		});

		crossroads.addRoute('/blog/topic/{topic}/page/{page}', function(topic, page) {
			getPage('blog').done(function(blog) {
				blog.displayPosts(page, topic, function () {
	                ascensor.setFloorByHash('blog');
	            });
			});
		});

		crossroads.addRoute('/post/{name}', function(name) {
			getPage('blog').done(function(blog) {
				blog.displayPost('/posts/' + name, function(ok) {
					if (ok) {
						ascensor.setFloorByHash('post');
					} else {
						ascensor.setFloorByHash('blog');
					}
				});
			});
		});

		crossroads.addRoute('/archive', function() {
			getPage('archive').done(function(archive) {
				archive.display();
				ascensor.setFloorByHash('archive');
			});
		});

		crossroads.addRoute('/portfolio', function() {
			getPage('portfolio').done(function() {
				ascensor.setFloorByHash('portfolio');
			});
		});
		
		crossroads.addRoute('/contact', function() {
			getPage('contact').done(function() {
				ascensor.setFloorByHash('contact');
			});
		});

        var parseHash = function(newHash) {
        	crossroads.parse(newHash);
        };

        hasher.prependHash = '!';
        hasher.initialized.add(parseHash);
        hasher.changed.add(parseHash);
        hasher.init();

        hasher.setHash('blog');

	    if (window.location.hash && $('#fader').is(':visible')) {
	        $('#fader').fadeOut();
	    }

	    $('footer button.up').on('click', function(e) {
	    	e.preventDefault();
	    	$(e.currentTarget).closest('.container').scrollTo({ top: '0px', left: '0px' }, 500, { easing: 'swing', queue: true, axis:'y' });
	    });
    });
});