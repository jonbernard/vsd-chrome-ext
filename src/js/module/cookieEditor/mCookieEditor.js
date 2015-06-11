define(["underwire", "jquery", "service/sChromeInteractions", "service/templates/sTemplates", "compiledTemplates/cookieEditor"], function (UU, $) {
	"use strict";
	UU.addModule("Cookie Editor", function (UU) {

		var sGoogle = UU.getService("Google Chrome Interactions"),
			sTemplates = UU.getService("templates"),
			browserView,
			testBucket,
			variantObj = {
				testVariants: {}
			},
			_createVariantObj = function(jiraObj) {
				if (browserView.currentHost) {
					var ajaxUrl = "https://" + browserView.currentHost + "/cookieEditor";
					$.ajax({
						url: ajaxUrl,
						type: "GET",
						success: function (response) {
							var html = $(response).find("select");
							html.each(function(){
								var variant = {
									id: $(this)[0].id,
									value: $(this).val(),
									options: {},
									index: parseInt($(this)[0].id.replace("T", ""), 10)-1,
									testVariant: ($(this)[0].id.indexOf("T") === 0) ? true : false
								};
								$(this).find("option").each(function(){
									var variantText = $(this).html().trim(),
										variantId = (variant.testVariant) ? variantText.substring(0, 1) : variantText;

									variant.options[variantId] = {
										id: variantId,
										label: variantText,
										selected: $(this)[0].selected,
										range: variantText.replace(/[^-0-9]/g, "").split("-")
									};
									if (!variant.testVariant) {
										variant.options[variantId].value = this.value;
									}
								});

								if (jiraObj) {
									var fixedId = (variant.id.length === 2) ? variant.id.substring(0, 1) + "0" + variant.id.substring(1, 2) : variant.id,
										jiraItem = $.grep(jiraObj, function( item, i ) {
											if (item.fields.customfield_11558) {
												return ( item.fields.customfield_11558.value === fixedId );
											}
										});
									if (jiraItem.length > 0) {
										variant.summery = jiraItem[0].fields.summary.replace(" Test", "").replace(/[^A-Za-z ]/g, "");
									}
								}
								if ($(this)[0].id.indexOf("T") !== -1) {
									variantObj.testVariants[$(this)[0].id] = variant;
								} else {
									variantObj[$(this)[0].id] = variant;
								}
							});
							//variantObj
				    		sGoogle.setStorage({variantObj: variantObj}, function () {console.log("added localstore");});
						},
						error: function (response) {
							alert("There was an error ending your session.");
						}
					});
				}
			};


		return {
			scope: "body",

			messages: {
				"VSDTools-browserView-set": function (message) {
					browserView = UU.getPageData("browserView");

				    sGoogle.getStorage("variantObj", function (result) {

						var date = new Date();

						if ((result.variantObj && date.getTime() > result.variantObj.timestamp + 86400000) || !result.variantObj) {
							variantObj.timestamp = date.getTime();

							$.ajax({
								url: "https://jira.lbidts.com/jira/rest/api/2/search",
								data: "jql=project+%3D+ABTEST+AND+status+in+(New,+Active)+ORDER+BY+cf[11558]+DESC",
								type: "GET",
								success: function (response) {
									_createVariantObj(response.issues);
								},
								error: function (response) {
									_createVariantObj();
								}
							});
						} else {
							variantObj = result.variantObj;
						}

				    });
				}
			},

			events: {
				"click #cookieEditor": function (event, target) {
					$("#loading").show();
					if (browserView.currentHost) {
						$.ajax({
							url: "https://" + browserView.currentHost + "/cookieEditor",
							type: "GET",
							success: function (response) {
								testBucket = response.match("testBucket = .*\.split")[0].trim().replace('testBucket = "', "").replace('".split', "").split(",");

								for (var i in variantObj.testVariants) {
									if (variantObj.testVariants.hasOwnProperty(i)) {
										variantObj.testVariants[i].value = testBucket[variantObj.testVariants[i].index];
									}
								}

								variantObj.eshopCountry.value = $(response).find("#eshopCountry option:selected").val();

								$("nav#menu").hide();
								$("#content").html(sTemplates.getMarkup("cookieEditor", variantObj));
								$("section#info").show();
								$("#loading").hide();
							},
							error: function (response) {
								alert("There was an error ending your session.");
							}
						});
					}
				},
				"click .radio-label": function (event, target) {
					var testBucketIndex = $(target).attr("data-t-number").replace("T", "")-1;

					testBucket[testBucketIndex] = $(target).find("input").val();

					$(target).parent().find("label").removeAttr("data-selected");
					$(target).attr("data-selected", "true");

					$.ajax({
						url: "https://" + browserView.currentHost + "/cookieEditor/save?tClear&tbucket=" + testBucket,
						type: 'GET',
						success: function () {
							var section = $(target).parent().parent();
							section.addClass("saved");
							setTimeout(function () {
								section.removeClass("saved");
							}, 1500);
							setTimeout(function () {
								sGoogle.reloadAllTab();
								window.close();
							}, 1800);

						},
						error: function () {
							console.log("error");
						}
					});
				},
				"change select": function (event, target) {
					console.log("select change", target);
					var country = $(target).val();

					$.ajax({
						url: "https://" + browserView.currentHost + "/cookieEditor/save/country?country=" + country,
						type: 'GET',
						success: function () {
							var section = $(target).parent().parent();
							section.addClass("saved");
							setTimeout(function () {
								section.removeClass("saved");
							}, 1500);
							setTimeout(function () {
								sGoogle.reloadAllTab();
								window.close();
							}, 1800);

						},
						error: function () {
							console.log("error");
						}
					});
				}
			}
		};
	});
});