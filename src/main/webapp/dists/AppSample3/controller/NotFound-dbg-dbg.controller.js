sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.mjzsoft.UserSurveys.controller.NotFound", {

		/** 
		 * called when not found page is initialized
		 */
		onInit: function () {
			this.getRouter().getTarget("notFound").attachDisplay(this._onNotFoundDisplayed, this);
		},

		/** 
		 * event hamdler when not found view displayed
		 */
		_onNotFoundDisplayed: function () {
			this.getModel("appView").setProperty("/layout", "OneColumn");
		}
	});
});