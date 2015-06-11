module.exports = {
	query: {
		phase: 'response',
		mimeType: 'text/html',
		method: 'GET'
	},
	fn: function cacheHtml(rule, opts, req, resp) {
		'use strict';
		var TWO_WEEKS = 1209600000;
		var expires = new Date(Date.now() + TWO_WEEKS).toUTCString();
		resp.headers.expires = expires;
		resp.headers['cache-control'] = 'max-age=157680000';
	}
};
