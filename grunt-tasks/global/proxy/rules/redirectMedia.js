module.exports = {
	query: {
		method: 'GET',
		phase: 'request',
		url: /media/
	},
	fn: function redirectMedia(rule, opts, req, resp) {
		'use strict';
		req.url = req.url.replace(/\/media/g, '');

		req.hostname = req.headers.host = opts.media;
		req.protocol = opts.protocol + ':';
		delete req.port;
	}
};
