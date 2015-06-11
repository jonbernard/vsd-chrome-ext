define(["underwire", "jquery", "handlebars", "service/sChromeInteractions", "service/templates/sTemplates", "compiledTemplates/popup", "compiledTemplates/contentError"], function (UU, $, Handlebars) {
	"use strict";
	UU.addModule("Popup Menu Content", function (UU) {

		var sGoogle = UU.getService("Google Chrome Interactions"),
			sTemplates = UU.getService("templates"),
			google = {},
			isZIndex = false,
			isMobile = false;

		return {
			scope: "body",

			events: {
				"click #toggleVideo": function (event, target) {
					sGoogle.sendMessage(google.currentTab, "toggleVideos", function() {});
					
					window.close();
				},
				"click #zIndexMap": function (event, target) {
					var broadcastType = (isZIndex) ? "VSDTools-z-index-map-hide" : "VSDTools-z-index-map-show";

					sGoogle.sendMessage(google.currentTab, broadcastType, function() {});
					
					window.close();
				},
				"click #invalidateSession": function (event, target) {
					$("#loading").show();
					var currentHost = google.currentHost;

					if (currentHost) {
						var ajaxUrl = "https://" + currentHost + "/invalidatesession";
						$.ajax({
							url: ajaxUrl,
							type: "GET",
							success: function (response) {
								console.log(response);
								sGoogle.reloadTab(google.currentTab);
								window.close();
							},
							error: function (response) {
								alert("There was an error ending your session.");
							}
						});
					}
				},
				"click #userAgent": function (event, target) {
					var newUAType = "desktop";

			    	if (isMobile === false) {
			    		newUAType = "mobile";
			    	} else {
			    		newUAType = "desktop";
			    	}

					sGoogle.setStorage({"UAType": newUAType}, function() {
						console.log("Settings saved");
						window.close();
					});
				},
				"click #deque": function (event, target) {
				    sGoogle.getStorage("blockDeque", function (result) {
			    		var blockDeque = (result && result.blockDeque === true) ? false : true;
						sGoogle.setStorage({"blockDeque": blockDeque}, function() {
							console.log("Settings saved");
							window.close();
						});
				    });
				},
				"click #back": function (event, target) {
					$("nav#menu").show();
					$("section#info").hide();
					$("html, body").css({height: ($("#menu > a").length*31)-1});
				}
			},

			init: function () {
				if (Handlebars) {
					Handlebars.registerHelper("between", function (value, bottomLimit, topLimit, options) {
						if (parseInt(value, 10) >= parseInt(bottomLimit, 10) && parseInt(value, 10) <= parseInt(topLimit, 10)) {
							return options.fn(this);
						} else {
							return options.inverse(this);
						}
					});
				}

				sGoogle.getCurrentTab(function(tabs) {
					google.currentTab = tabs[0].id;
					sGoogle.sendMessage(google.currentTab, "checkHost", function(response) {
						google.currentHost = response.host;
					});
					sGoogle.sendMessage(google.currentTab, "checkContentScript", function(response) {
						if (response.popupContent) {
					    	sGoogle.getStorage("blockDeque", function (storage) {
					    		response.popupContent.blockDeque = (storage && storage.blockDeque === true) ? true : false;
								isZIndex = response.popupContent.isZIndex;
								isMobile = response.popupContent.isMobile;

								console.log(response.popupContent);
								UU.setPageData("browserView", $.extend(google, response.popupContent));

								$("body").html(sTemplates.getMarkup("popup", response.popupContent));

								UU.broadcast({
									"type": "VSDTools-browserView-set"
								});

								$("#menu").height(($("#menu > a").length*31)-1);
							});
						} else {
							$("body").html(sTemplates.getMarkup("contentError", response.popupContent));
						}
					});
					sGoogle.setStorage({"UATab": google.currentTab});
				});
				
				console.log("VSD Dev Tools >> Finished");
			}
		};
	});
});