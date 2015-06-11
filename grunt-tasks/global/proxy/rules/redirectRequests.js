module.exports = {
	query: {
		phase: 'request',
		url: /\.js|\.css|\.cur|\.png/,
		method: 'GET'
	},
	fn: function redirectRequests(rule, opts, req, resp) {
		'use strict';
		if (req.url.lastIndexOf('resources') < 0) {
			return;
		}

		if (opts.split) {
			req.url = req.url.replace(/resources\/js\//i, 'js/');
			req.url = req.url.replace(/commerce2\//i, 'js/');
		}

		req.protocol = req.protocol.replace(/https/i, 'http');
		req.hostname = opts.targetHost;
		req.port = opts.connectPort;
	}
};
