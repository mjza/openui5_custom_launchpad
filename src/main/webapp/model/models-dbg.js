sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"com/mjzsoft/Mjzsoft0Launchpad/conf/env"
], function (JSONModel, Device, env) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createLanguageModel: function () {
			var oModel = new JSONModel(env.languages);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};
});