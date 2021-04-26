sap.ui.define([
	"com/mjzsoft/QuestionnaireBuilder/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.mjzsoft.QuestionnaireBuilder.controller.App", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the app controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			var oViewModel = this._initViewModel();
			this.setModel(oViewModel, "appView");

			var fnSetAppNotBusy = function () {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// since then() has no "reject"-path attach to the MetadataFailed-Event to disable the busy indicator in case of an error
			this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		//appViewModel
		_initViewModel: function () {
			return new JSONModel({
				busy: true,
				flexBoxDirection: "Row",
				datesChanged: false,
				delay: 0,
				layout: "OneColumn",
				previousLayout: "",
				editMode: false,
				actionButtonsInfo: {
					midColumn: {
						fullScreen: false
					}
				}
			});
		}
	});
});