sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";
	return {
		
		/** 
		 * The model contains some setting of the device type. 
		 * @returns {sap.ui.model.json.JSONModel} the created JSON model
		 */
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		/** 
		 * The model contains some setting of fiori launchpad 
		 * @returns {sap.ui.model.json.JSONModel} the created JSON model
		 */
		createFLPModel: function () {
			var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
				bIsShareInJamActive = fnGetuser ? fnGetuser().isJamActive() : false,
				oModel = new JSONModel({
					isShareInJamActive: bIsShareInJamActive
				});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}
	};
});