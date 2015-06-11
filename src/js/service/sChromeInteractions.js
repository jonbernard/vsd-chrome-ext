define(["underwire"], function (UU) {
	'use strict';

	UU.addService("Google Chrome Interactions", function (App) {

		var chrome = window.chrome;

		return {
			createTab: function (data) {
				chrome.tabs.create(data);
			},

			reloadTab: function (chomeTab) {
				chrome.tabs.reload(chomeTab);
			},

			reloadAllTab: function () {
				chrome.tabs.query({}, function(result) {
					for (var i = 0; i < result.length; i++) {
						if (result[i].url.indexOf("dev-005.lbidts.com") !== -1 ||
							result[i].url.indexOf("test-005.lbidts.com") !== -1 ||
							result[i].url.indexOf("vsdpint.lbidts.com") !== -1) {
							chrome.tabs.reload(result[i].id);
						}
					}
				});
			},

			getCurrentTab: function (callback) {
				chrome.tabs.query({active: true, currentWindow: true}, callback);
			},

			sendMessage: function (chomeTab, func, callback) {
				chrome.tabs.sendMessage(chomeTab, {func: func}, callback);
			},
	  
			getStorage: function (storageName, callback) {
				chrome.storage.local.get(storageName, callback);
			},
	  
			setStorage: function (objToSave, callback) {
				chrome.storage.local.set(objToSave, callback);
			}
		};
	});
});
