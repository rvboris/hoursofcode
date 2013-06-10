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
        'jquery.fancybox': '//cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.4/jquery.fancybox.pack',
        'datepicker': 'libs/datepicker/bootstrap-datepicker',
        'datepicker-ru': 'libs/datepicker/locales/bootstrap-datepicker.ru',
        'prism': 'libs/prism',
        'select2': 'libs/select2',
        'select2ru': 'libs/select2ru'
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
        'datepicker': {
            deps: ['jquery'],
            exports: 'jQuery.fn.datepicker'
        },
        'datepicker-ru': {
            deps: ['datepicker'],
            exports: 'jQuery.fn.datepicker'
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
        },
        'prism': {
            exports: 'Prism'
        },
        'select2': {
            exports: 'Select2'
        },
        'select2ru': {
            deps: ['select2'],
            exports: 'Select2'
        }
    }
});

define(['jquery', 'lodash', 'libs/hasher', 'crossroads', 'libs/uuid', 'blog', 'moment', 'select2ru', 'datepicker-ru'], function ($, _, hasher, crossroads, uuid, Blog, moment) {
    var codeMirrorSettings = {
        mode: {
            name: "htmlmixed",
            scriptTypes: [{
                    matches: /\/x-handlebars-template|\/x-mustache/i,
                    mode: null
                }, {
                    matches: /(text|application)\/(x-)?vb(a|script)/i,
                    mode: "vbscript"
                }
            ]
        },
        tabMode: "indent",
        styleActiveLine: true,
        lineNumbers: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
        matchBrackets: true,
        styleActiveLine: true,
        highlightSelectionMatches: true
    };

    $(document).ready(function () {
        var blog = new Blog();
        var shortTextEditor, fullTextEditor;

        $('#date').datepicker({ format: 'dd/mm/yyyy', language: 'ru' });

        $("#topics").select2({
            tags: [],
            tokenSeparators: [",", " "],
            width: '282px'
        });

        $('#save-post').on('click', function() {
            var postData = {};

            postData.title = $('#title').val();
            postData.date = $('#date').val();
            postData.uuid = $('#uuid').val();
            postData.topics = $("#topics").select2('val');

            if (shortTextEditor.getValue().length > 0) {
                postData.shortText = shortTextEditor.getValue();
            }

            if (fullTextEditor.getValue().length > 0) {
                postData.fullText = fullTextEditor.getValue();
            }

            postData.template = 'post-json.jade';

            var bb = new BlobBuilder();

            bb.append(JSON.stringify(postData));

            var blob = bb.getBlob("application/json;charset=" + document.characterSet);

            saveAs(blob, 'data.json');
        });

        var populateFields = function(postData) {
            $('#title').val(postData.title);
            $('#date').val(postData.date);
            $('#uuid').val(postData.uuid);
            
            if (!_.isUndefined(postData.shortText)) {
                shortTextEditor.setOption('value', postData.shortText);
            }

            if (!_.isUndefined(postData.fullText)) {
                fullTextEditor.setOption('value', postData.fullText);
            }

            if (!_.isUndefined(postData.topics)) {
                $("#topics").select2('data', _.map(postData.topics, function(topic) {
                    return { id: topic, text: topic };
                }));
            }
        };

        crossroads.addRoute('/edit/{post}', function(post) {
            blog.init().done(function(blog) {
                blog.getPost('/posts/' + post).done(function(postUrl, postData) {
                    populateFields(postData);
                });
            });
        });

        var parseHash = function(newHash) {
            if (_.isEmpty(newHash)) {
                populateFields({
                    title: '',
                    date: moment().format('DD/MM/YYYY'),
                    uuid: uuid()
                });
                return;
            }

            crossroads.parse(newHash);
        };

        hasher.prependHash = '!';
        hasher.initialized.add(parseHash);
        hasher.changed.add(parseHash);
        hasher.init();

        shortTextEditor = CodeMirror.fromTextArea($('.short-text').get(0), codeMirrorSettings);
        fullTextEditor = CodeMirror.fromTextArea($('.full-text').get(0), codeMirrorSettings);
    });
});