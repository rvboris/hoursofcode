define(['jquery', 'lodash', 'libs/hasher', 'handlebars', 'jquery.simplePagination', 'jquery.scrollTo', 'prism'], function($, lodash, hasher) {
	var Blog = function() {
		this.options = {
			postsPerPage: 5
		};

		this.postsList = null;
		this.topicsList = null;
		this.postsCache = null;

		this.postTemplate = Handlebars.compile($('#post-template').html());
		this.postSeparatorTemplate = Handlebars.compile($('#post-separator-template').html());
		this.postPaginatorTemplate = Handlebars.compile($('#post-paginator-template').html());
		this.fullPostTemplate = Handlebars.compile($('#full-post-template').html());

		$('.blog-section section.content').on('click', 'a.more', _.bind(function(e) {
			e.preventDefault();

			var postUrl = $(e.currentTarget).attr('href');
			var postName = _.compact(postUrl.split('/'))[1];

			this.displayPost(postUrl, function(result, post) {
				if (result) {
					hasher.setHash('/post/' + postName);
				} else {

				}
			});
		}, this));
	};

	Blog.prototype.init = function() {
		var deferred = $.Deferred();

		if (!_.isNull(this.topicsList) && !_.isNull(this.postsList)) {
			deferred.resolveWith(this, [this]);
		} else {
			$.getJSON('/posts-list.json').done(_.bind(function(data) {
				this.topicsList = data.topics;
				this.postsList = data.posts;

				deferred.resolveWith(this, [this]);
			}, this));
		}

		return deferred.promise();
	};

	Blog.prototype.paginator = function(currentPage, topic) {
		$('.blog-section .paginator').pagination({
			items: this.postsList.length,
			itemsOnPage: this.options.postsPerPage,
			cssStyle: '',
			currentPage: currentPage || 1,
			hrefTextPrefix: _.isNull(topic) ? '#!/blog/page/' : '#!/blog/topic/' + topic + '/page/',
			prevText: '&larr;',
			nextText: '&rarr;',
			onPageClick: this.scrollUp
		});
	};

	Blog.prototype.getPost = function(postUrl) {
		var postName = _.compact(postUrl.split('/'))[1];
		var deferred = $.Deferred();

		if (_.isNull(this.postsCache)) {
			this.postsCache = [];
		}

		if (this.postsCache[postName]) {
			deferred.resolve(postUrl, this.postsCache[postName]);
		} else {
			$.getJSON(postUrl + '/data.json').done(_.bind(function(post) {
				this.postsCache[postName] = post;
				deferred.resolve(postUrl, this.postsCache[postName]);
			}, this));
		}

		return deferred.promise();
	};

	Blog.prototype.displayPosts = function(page, topic, callback) {
		page--;

		var renderedPosts = [];
		var posts;

		if (!_.isNull(topic)) {
			var topicIdx = _.indexOf(this.topicsList, topic);
			var posts = _.filter(this.postsList, function(postListItem) {
				return _.indexOf(postListItem[1], topicIdx) >= 0;
			});
		} else {
			posts = this.postsList;
		}

		var postsCount = _.size(posts);

		if (postsCount === 0) {
			if (_.isFunction(callback)) {
				callback(false);
			}

			return;
		} else if (postsCount > this.options.postsPerPage) {
			posts = posts.slice(page * this.options.postsPerPage, (page * this.options.postsPerPage) + this.options.postsPerPage);
		}

		var renderPosts = _.after(_.size(posts), _.bind(function() {
			$('.blog-section section.content').html(renderedPosts.join(this.postSeparatorTemplate()) + this.postPaginatorTemplate());

			if (postsCount > this.options.postsPerPage) {
				this.paginator(page + 1, topic);
			}

			this.displayBloggerStream();
			this.visuals();
			
			if (_.isFunction(callback)) {
				callback();
			}
		}, this));

		var requests = _.map(posts, function(postInfo) {
			return this.getPost(postInfo[0]);
		}, this);

		$.when.apply($, requests).done(_.bind(function () {
			if (_.size(requests) > 1) {
				_.each(arguments, function(result) {
					renderedPosts.push(this.postTemplate({ url: result[0], post: result[1] }));
					renderPosts();
				}, this);
			} else {
				renderedPosts.push(this.postTemplate({ url: arguments[0], post: arguments[1] }));
				renderPosts();
			}
		}, this));
	};

	Blog.prototype.displayPost = function(postUrl, callback) {
		this.getPost(postUrl).done(_.bind(function(postUrl, post) {
			$('.post-section section.content').html(this.fullPostTemplate({ url: postUrl, post: post }));

			Prism.highlightAll();
			
			this.displayCommentsStream(post).done(function() {
				callback(true);
			}).fail(function() {
				callback(false);
			});
		}, this)).fail(function() {
			callback(false);
		});
	};

	Blog.prototype.displayCommentsStream = function(post) {
		var deferred = $.Deferred();

		try {
			HC.widget('Stream', {
				widget_id: 6177,
				xid: post.uuid,
				language: 'ru',
				title: post.title,
				CSS_READY: 1,
				callback: deferred.resolve
			});
		} catch (e) {
			deferred.reject();
		}

		return deferred.promise();
	};

	Blog.prototype.displayBloggerStream = function() {
		try {
			HC.widget('Bloggerstream', {
				widget_id: 6177,
				selector: '.comments-count'
			});
		} catch (e) {
			if (console.log) {
				console.log(e);
			}
		}
	};

	Blog.prototype.visuals = function() {
		$('article time .day,  article time .month, article time .year').slabText({
			forceNewCharCount: false
		});

		Prism.highlightAll();
	};

	Blog.prototype.scrollUp = function() {
		$('.blog-section .container').scrollTo({ top: '0px', left: '0px' }, 500, { easing: 'swing', queue: true, axis:'y' });
	};

	return Blog;
});