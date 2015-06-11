module.exports = {
	query: {
		phase: 'response',
		url: /\.js|\.css/,
		method: 'GET'
	},
	fn: function disableCacheFewd(rule, opts, req, resp) {
		'use strict';
		delete resp.headers['Cache-Control'];
		delete resp.headers.etag;
		delete resp.headers['last-modified'];

		resp.headers['cache-control'] = 'no-cache';
	}
};
