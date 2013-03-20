define(['jquery', 'lodash', 'registry', 'handlebars', 'jquery.simplePagination'], function($, lodash, Registry) {
	var Blog = function() {
		this.options = {
			postsPerPage: 5
		};

		this.postsList = null;
		this.topicsList = null;
		this.postsCache = null;

		this.postTemplate = Handlebars.compile($('#post-template').html());
		this.postSeparatorTemplate = Handlebars.compile($('#post-separator-template').html());
		this.fullPostTemplate = Handlebars.compile($('#full-post-template').html());

		$('#ascensorFloor1 section.content').on('click', 'a.more', $.proxy(function(e) {
			e.preventDefault();

			var postName = _.compact($(e.currentTarget).attr('href').split('/'))[1];

			this.displayPost(postName, this.postsCache, function(result, post) {
				if (result) {
					Registry.get('router').setRoute('/page/' + postName);
				} else {

				}
			});
		}, this));
	};

	Blog.prototype.init = function() {
		var deferred = $.Deferred();

		$.get('/posts-list.json').done($.proxy(function(data) {
			this.topicsList = data.topics;
			this.postsList = data.posts;

			if (this.postsList.length > this.options.postsPerPage) {
				$('.paginator').pagination({
					items: this.postsList.length,
					itemsOnPage: this.options.postsPerPage,
					cssStyle: 'light-theme',
					hrefTextPrefix: '#/blog/page/',
					onPageClick: $.proxy(function(page) {
						this.getPosts(page, $.proxy(function() {
							this.visuals();
						}, this));
					})
				});
			}

			this.getPosts(1, $.proxy(function() {
				deferred.resolve();
				this.visuals();
			}, this));

		}, this));

		return deferred.promise();
	};

	Blog.prototype.getPosts = function(page, callback) {
		page--;

		var posts = this.postsList.slice(page * this.options.postsPerPage, (page * this.options.postsPerPage) + this.options.postsPerPage);

		var renderedPosts = [];

		var requests = _.map(posts, function(postInfo) {
			return $.ajax(postInfo[0] + 'data.json', { dataType: 'json' });
		});

		var renderPosts = _.after(requests.length, $.proxy(function() {
			$('#ascensorFloor1 section.content').html(renderedPosts.join(this.postSeparatorTemplate()));

			if (_.isFunction(callback)) {
				callback();
			}
		}, this));

		$.when.apply(requests).done($.proxy(function() {
			this.postsCache = [];

			_.forEach(requests, $.proxy(function(request) {
				request.done($.proxy(function(post) {
					this.postsCache.push(post);
					renderedPosts.push(this.postTemplate(post));
					renderPosts();
				}, this));
			}, this));
		}, this));

		callback();
	};


	Blog.prototype.displayPost = function(postName, postsCache, callback) {
		var postToRender;

		if (_.isArray(postsCache)) {
			postToRender = _.filter(this.postsCache, function(post) { return post.title === postName })[0] || false;
		} else {
			postToRender = null;
		}

		if (postToRender) {
			$('#ascensorFloor2 section.content').html(this.fullPostTemplate(postToRender));
			HC.widget("Stream", {
				widget_id: 6177,
				xid: postToRender.uuid,
				language: 'ru',
				title: postToRender.title,
				CSS_READY: 1,
				callback: function() {
					if (_.isFunction(callback)) {
						callback(true);
					}
				}
			});
		} else if (_.isFunction(callback)) {
			callback(false);
		}
	};

	Blog.prototype.visuals = function() {
		$('article time .day,  article time .month, article time .year').slabText({
			forceNewCharCount: false
		});
	};

	return Blog;
});