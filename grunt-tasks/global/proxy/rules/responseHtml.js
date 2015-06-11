(function () {
	'use strict';

	var grunt = require('grunt');
	var _ = require('lodash-node');
	var proxyMedia = !!grunt.option('media');

	module.exports = {
		priority: 100,
		query: {
			phase: 'response',
			mimeType: 'text/html',
			as: 'string'
		},
		replacements: [{
				find: 'class\=([^\"\'])',
				flags: 'gi',
				replace: '$1'
			}, {
				find: '\/build\/r?[a-f0-9]*\/',
				flags: 'gi',
				replace: '/'
			}, {
				find: '\<\/head>',
				replace: '<script src="http://<%=targetHost %>:35729/livereload.js?snipver=1"></script></head>'
			}, {
				find: '<%=media %>\/resources\/js',
				flags: 'gi',
				replace: '<%=targetHost %>:<%=port %>/resources/js'
			}, {
				find: '//tags.tiqcdn.com/utag/victoriassecret/main/dev/utag.js',
				flags: 'gi',
				replace: '//tags.tiqcdn.com/utag/victoriassecret/sandbox/dev/utag.js'
			}, {
				find: '<%=media %>\/resources',
				flags: 'gi',
				replace: '<%=targetHost %>:<%=connectPort %>/resources'
			},
			proxyMedia ? {
				find: '(http[s]?:)?\/\/<%=media %>',
				flags: 'gi',
				replace: 'http://<%=targetHost %>:<%=port %>/media'
			} : {
				find: '(http[s]?:)?\/\/<%=media %>',
				flags: 'gi',
				replace: '<%=protocol %>://<%=media %>'
			}, {
				find: 'http[s]?:\/\/<%=stage %>',
				flags: 'gi',
				replace: ''
			}, {
				find: '\/\/<%=stage %>',
				flags: 'gi',
				replace: ''
			}, {
				find: 'http[s]?:\/\/<%=stage %>',
				flags: 'gi',
				replace: ''
			}, {
				find: 'victoriassecret\.widget\.custhelp\.com',
				flags: 'gi',
				replace: ''
			}, {
				find: 'bcvippc02\.rightnowtech\.com',
				flags: 'gi',
				replace: ''
			}
		]
	};

})();
