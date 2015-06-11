var _ = require('lodash-node');

(function () {
	'use strict';

	var sortRules = function (cur, next) {
		return (cur && cur.priority || 0) > (next && next.priority || 0) ? -1 : 1;
	};

	function Interceptor(proxy) {
		this.proxy = proxy;
	}

	Interceptor.prototype.handleReplacement =
		function handleReplacement(rule, req, resp, replacement) {
			resp[rule.query.as] = resp[rule.query.as].replace(
				replacement.find, replacement.replace);
		};

	Interceptor.prototype.handleReplacements =
		function handleReplacements(rule, opts, req, resp) {
			_.each(rule.replacements, this.handleReplacement.bind(this, rule, req, resp));
		};

	Interceptor.prototype.getHandler = function (rule, opts) {
		var fn = rule.fn || this.handleReplacements;
		return fn.bind(this, rule, opts);
	};

	Interceptor.prototype.apply = function (opts) {

		// rule ordering is important in some cases, thus we sort by priority
		opts.rules = opts.rules.sort(sortRules);

		_.each(opts.rules, function (rule) {
			this.proxy.intercept(rule.query, this.getHandler(rule, opts));
		}.bind(this));
	};

	module.exports = Interceptor;
})();
