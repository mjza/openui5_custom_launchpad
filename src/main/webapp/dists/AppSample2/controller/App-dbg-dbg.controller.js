sap.ui.define([
	"com/mjzsoft/QuestionnaireStatistics/controller/BaseController",
	"com/mjzsoft/QuestionnaireStatistics/model/models"
], function (BaseController, models) {
	"use strict";

	return BaseController.extend("com.mjzsoft.QuestionnaireStatistics.controller.App", {

		onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = models.initAppViewModel();
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function () {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// since then() has no "reject"-path attach to the MetadataFailed-Event to disable the busy indicator in case of an error
			this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			//this.getModel("resource").getData().Resource[0].Name = this.getResourceBundle().getText("TitMLocations");
			//this.getModel("resource").getData().Resource[1].Name = this.getResourceBundle().getText("TitMCar");
			//this.getModel("resource").getData().Resource[2].Name = this.getResourceBundle().getText("TitMEquipment");
			//this.getModel("resource").getData().Resource[3].Name = this.getResourceBundle().getText("TitMRoom");
		},

		//stateChange Event-Handler for FlexibleColumnLayout
		onStateChangedFlexibleColumnLayout: function (oEvent) {
			var oViewModel = this.getModel("appView"),
				oLayout;
			if (oViewModel) {
				oLayout = oViewModel.getProperty("/layout");
				if (oLayout === "TwoColumnsBeginExpanded" || oLayout === "ThreeColumnsBeginExpandedEndHidden" || oLayout === "OneColumn") {
					oViewModel.setProperty("/FlexBoxDirection", "Row");
				} else {
					oViewModel.setProperty("/FlexBoxDirection", "Column");
				}
			}
		}
	});
});