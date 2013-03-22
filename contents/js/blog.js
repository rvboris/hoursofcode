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
		this.postPaginatorTemplate = Handlebars.compile($('#post-paginator-template').html());
		this.fullPostTemplate = Handlebars.compile($('#full-post-template').html());

		$('#ascensorFloor1 section.content').on('click', 'a.more', $.proxy(function(e) {
			e.preventDefault();

			var postUrl = $(e.currentTarget).attr('href');
			var postName = _.compact(postUrl.split('/'))[1];

			this.displayPost(postUrl, function(result, post) {
				if (result) {
					Registry.get('router').setRoute('/page/' + postName);
				} else {

				}
			});
		}, this));
	};

	Blog.prototype.init = function() {
		var deferred = $.Deferred();

		$.getJSON('/posts-list.json').done(_.bind(function(data) {
			this.topicsList = data.topics;
			this.postsList = data.posts;

			this.displayPosts(1, _.bind(function() {
				deferred.resolve();
			}, this));
		}, this));

		return deferred.promise();
	};

	Blog.prototype.paginator = function() {
		$('#ascensorFloor1 .paginator').pagination({
			items: this.postsList.length,
			itemsOnPage: this.options.postsPerPage,
			cssStyle: 'light-theme',
			hrefTextPrefix: '#/blog/page/',
			onPageClick: _.bind(function(page) {
				Registry.get('router').setRoute('/blog/page/' + page);
			}, this)
		});
	}

	Blog.prototype.getPost = function(postUrl) {
		var postName = _.compact(postUrl.split('/'))[1];
		var deferred = $.Deferred();

		if (_.isNull(this.postsCache)) {
			this.postsCache = [];
		}

		if (this.postsCache[postName]) {
			deferred.resolve(postUrl, this.postsCache[postName]);
		} else {
			$.getJSON(postUrl + 'data.json').done(_.bind(function(post) {
				this.postsCache[postName] = post;
				deferred.resolve(postUrl, this.postsCache[postName]);
			}, this));
		}

		return deferred.promise();
	};

	Blog.prototype.displayPosts = function(page, callback) {
		page--;

		var posts = this.postsList.slice(page * this.options.postsPerPage, (page * this.options.postsPerPage) + this.options.postsPerPage);
		var renderedPosts = [];

		var renderPosts = _.after(_.size(posts), _.bind(function() {
			$('#ascensorFloor1 section.content').html(renderedPosts.join(this.postSeparatorTemplate()) + this.postPaginatorTemplate());

			if (this.postsList.length > this.options.postsPerPage) {
				this.paginator();
			}

			this.visuals();
			
			if (_.isFunction(callback)) {
				callback();
			}
		}, this));

		var requests = _.map(posts, function(postInfo) {
			return this.getPost(postInfo[0]);
		}, this);

		$.when.apply($, requests).done(_.bind(function () {
			_.each(arguments, function(result) {
				renderedPosts.push(this.postTemplate({ url: result[0], post: result[1] }));
				renderPosts();
			}, this);
		}, this));
	};

	Blog.prototype.displayPost = function(postUrl, callback) {
		this.getPost(postUrl).done(_.bind(function(postUrl, post) {
			$('#ascensorFloor2 section.content').html(this.fullPostTemplate({ url: postUrl, post: post }));
			
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

	Blog.prototype.visuals = function() {
		$('article time .day,  article time .month, article time .year').slabText({
			forceNewCharCount: false
		});
	};

	return Blog;
});