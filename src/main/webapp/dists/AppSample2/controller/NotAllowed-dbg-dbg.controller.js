sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.mjzsoft.QuestionnaireStatistics.controller.NotAllowed", {

		onInit: function () {
			if (this.getOwnerComponent().getCurrentUser() !== null && this.getOwnerComponent().getCurrentUser().admin) {
				this.getRouter().navTo("master", {}, true);
			}
		},

		/** 
		 * event fired when user clicks on link to go to main page
		 */
		onLinkPressed: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#Shell-home"
				}
			});
		}
	});
});