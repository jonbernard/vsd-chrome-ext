define(["underwire", "handlebars"], function (UU, Handlebars) {
	'use strict';

	UU.addService("templates", function (App) {

		return {
			/**
			 * This function attempts to find the template you are requesting.
			 *	If IS found  -> it will return the template populated with the data you sent it.
			 *	If NOT found -> While we're developing this - it will return a message starting the name that was not found.
			 *
			 * @param {String} templateId - The ID of the template you want. This ID can be found around line 2 of the compiled template (e.g. templates['oneShippingAddress']).
			 * @param {JSON} data - Used to populate the template. Make sure it matches the format the template is expecting.
			 *
			 * @returns {String} The HTML of the template populated with data.
			 *
			 * @see {@link https://jira.lbidts.com/confluence/display/fewd/Clientside+Template+Compilation} for more on precompiled templates.
			 */
			getMarkup: function (templateId, data) {
				//console.log("Create the object to hold the template if it is found");
				var template = null;

				//console.log("Make sure that Handlebars, some registered templates, and the request one are all available");
				if (Handlebars && Handlebars.templates && Handlebars.templates[templateId]) {

					//console.log("Get the request template and put it in the placeholder");
					template = Handlebars.templates[templateId];
				}

				//TODO - Remove the return of an error
				return template ? template(data) : "<h1 style='color:#f00'>" + templateId + " NOT FOUND</h1>";
			}
		};
	});
});
