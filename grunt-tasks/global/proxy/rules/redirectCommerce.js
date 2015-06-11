module.exports = {
	query: {
		phase: 'request',
		method: 'POST'
	},
	fn: function redirectCommerce(rule, opts, req, resp, done) {
		'use strict';

		if (req.url === '/metrics') {
			done();
			return;
		}

		var host = opts.stage;

		var matches = opts.stage.match(/(.+):(\d+)/i, '');
		if (matches && matches.length > 2) {
			host = matches[1];
			req.port = matches[2];
		}

		var origin = req.protocol + '//' + opts.stage + (req.port ? ':' + req.port : '');
		req.headers.Accept = req.headers.accept;
		req.headers.Referer = origin + req.url;
		req.headers.Host = host;
		req.headers.Origin = origin;
		req.headers.Cookie = req.headers.cookie;
		req.headers.Connection = req.headers.connection;

		req.headers['Accept-Encoding'] = req.headers['accept-encoding'];
		req.headers['Accept-Language'] = req.headers['accept-language'];
		req.headers['Content-Type'] = req.headers['content-type'];
		req.headers['Content-Length'] = req.headers['content-length'];
		req.headers['Cache-Control'] = 'no-cache';
		req.headers['User-Agent'] = req.headers['user-agent'];

		delete req.headers.connection;
		delete req.headers.origin;
		delete req.headers.referer;
		delete req.headers.host;
		delete req.headers.accept;
		delete req.headers.cookie;
		delete req.headers['accept-language'];
		delete req.headers['accept-encoding'];
		delete req.headers['content-encoding'];
		delete req.headers['content-type'];
		delete req.headers['content-length'];
		delete req.headers['cache-control'];
		delete req.headers['user-agent'];

		// delete resp.statusCode;
		resp._populated = false;
		req._populated = false;
		done();
	}
};
