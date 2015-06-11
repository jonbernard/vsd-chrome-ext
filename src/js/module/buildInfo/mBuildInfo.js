define(["underwire", "jquery", "service/templates/sTemplates", "compiledTemplates/buildInfo"], function (UU, $) {
	"use strict";
	UU.addModule("Platform Build Information", function (UU) {
		
		var sTemplates = UU.getService("templates");

		return {
			scope: "body",

			events: {
				"click #buildInfo": function (event, target) {
					$("#loading").show();
					var buildID = $(target).attr("data-build-id");
					console.log(buildID);

					if (buildID) {
						var ajaxUrl = "https://stash.lbidts.com/rest/api/1.0/projects/ECOMM/repos/vsdweb/commits/" + buildID;
						$.ajax({
							url: ajaxUrl,
							type: "GET",
							success: function (response) {
								var formattedDate = new Date(response.authorTimestamp);
								response.formattedDate = formattedDate.toString().replace("GMT-0500 ", "");

								$("nav#menu").hide();
								$("#content").html(sTemplates.getMarkup("buildInfo", response));
								$("section#info").show();
							},
							error: function (response) {
								if (response.responseJSON.errors[0].exceptionName.indexOf("AuthorisationException") > -1) {
									response.responseJSON.errors[0].showLoginLink = true;
								}
								$("#content").html(sTemplates.getMarkup("buildInfo", response.responseJSON));
								$("nav#menu").hide();
								$("section#info").show();
							},
							complete: function (response) {
								$("html, body").height($("#info").height());
								$("#loading").hide();
							}
						});
					}
					
				}
			}
		};
	});
});