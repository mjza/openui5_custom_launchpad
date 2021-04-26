sap.ui.define([
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/DialogType",
	"sap/m/ButtonType"
], function (Dialog, Text, Button, DialogType, ButtonType) {

	"use strict";

	return {
		
		/** 
		 * Shows a return dialog
		 * @param {sap.ui.core.mvc.Controller} oViewController The parent control 
		 * @param {string} sTitle title of the dialog
		 * @param {string} sValueState the value state
		 * @param {array} aMessageVars list of messages 
		 * @param {function} fnCallback the call back function on confirmation
		 * @param {boolean} bConfirmationDialog if it is a confirmation dialog
		 * @param {string} sBeginBtnText the text of the left button
		 * @param {boolean} beginVisibility the visibility of the left button
		 * @param {string} sEndBtnText the text of the right button
		 * @param {boolean} endVisibility the visibility of the right button
		 * @returns {sap.m.Dialog} The generated dialog
		 */
		 // eslint-disable-next-line max-params
		showDialog: function (oViewController, sTitle, sValueState, aMessageVars, fnCallback, bConfirmationDialog, sBeginBtnText, beginVisibility, sEndBtnText, endVisibility) {
			var oDialog = new Dialog({
				title: sTitle,
				type: DialogType.Message,
				state: sValueState,
				content: new Text({
					text: aMessageVars
				}),
				beginButton: new Button({
					text: sBeginBtnText,
					visible: beginVisibility,
					width: bConfirmationDialog ? "45%" : "30%",
					press: function () {
						oDialog.close();
						if (fnCallback === undefined) {
							return;
						} else {
							fnCallback();
						}
					},
					type: bConfirmationDialog ? ButtonType.Accept : ButtonType.Default
				}),
				endButton: new Button({
					text: sEndBtnText,
					visible: endVisibility,
					width: bConfirmationDialog ? "45%" : "30%",
					press: function () {
						oDialog.close();
					},
					type: bConfirmationDialog ? ButtonType.Reject : ButtonType.Default
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});
			oDialog.open();
			return oDialog;
		},
		
		/**
		 * A helper function to read data from back-end 
		 * @function
		 * @public
		 * @param {sap.ui.odata.Model} oModel The intended model to work on
		 * @param {string} sEntitySet Name of the entity
		 * @param {object} oUrlParams The params that must pass as URL parameters
		 * @param {sap.ui.model.Filter} aFilter The filter that must send with request
		 * @return {Promise} A promise to do the job
		 */
		readData: function (oModel, sEntitySet, oUrlParams, aFilter) {
			var oPromise = jQuery.Deferred();
			oModel.read(sEntitySet, {
				urlParameters: oUrlParams,
				filters: aFilter,
				success: oPromise.resolve,
				error: oPromise.reject
			});
			return oPromise;
		}
	};
});