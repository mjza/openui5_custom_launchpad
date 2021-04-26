sap.ui.define([
	"com/mjzsoft/Mjzsoft0Launchpad/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.mjzsoft.Mjzsoft0Launchpad.controller.App", {

		onInit: function () {
			var oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "lappView");
			//this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			sap.ui.getCore().getEventBus().subscribe("App", "StartAppBusy",  this.startAppBusy, this);
			sap.ui.getCore().getEventBus().subscribe("App", "StopAppBusy",   this.stopAppBusy, this);
		},
		
		getViewModel: function () {
			return this.getModel("lappView");
		},

		onNavigate: function () {
			this.getViewModel().setProperty("/busy", true);
		},
		onAfterNavigate: function () {
			this.getViewModel().setProperty("/busy", false);
		},
		
		stopAppBusy : function()
		{
			this.getViewModel().setProperty("/busy", false);
		},
		
		startAppBusy : function()
		{
			this.getViewModel().setProperty("/busy", true);
		}
				
	});
});