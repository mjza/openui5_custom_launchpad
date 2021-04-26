sap.ui.define([
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Button",
	"sap/ui/core/ValueState"
], function (Dialog, Text, Button, ValueState) {
	"use strict";
	return {
		/** 
		 * Generates and opens a dialog
		 * @param {sap.ui.core.mvc.Controller} oViewController parent controller
		 * @param {string} sTitle title of the dialog 
		 * @param {array} aMessageVars message of the dialog
		 * @param {function} fnCallbackLeft call back function 
		 * @param {boolean} bConfirmationDialog if the dialog is a confirm dialog 
		 * @param {function} fnCallbackRight the call back for right key
		 * @param {string} sBtnLeft name of the left key 
		 * @param {string} sBtnRight name of the right key
		 * @returns {sap.m.Dialog} the generated dialog 
		 */
		showDialog: function (oViewController, sTitle, aMessageVars, fnCallbackLeft, bConfirmationDialog, fnCallbackRight, sBtnLeft, sBtnRight) {
			var oDialog = new Dialog({
				title: sTitle,
				type: sap.m.DialogType.Message,
				state: bConfirmationDialog ? ValueState.Warning : ValueState.Success,
				content: new Text({
					text: aMessageVars
				}),
				buttons: [new Button({
						text: bConfirmationDialog ? oViewController.getResourceBundle().getText("BtnYes") : sBtnRight,
						width: bConfirmationDialog ? "45%" : "30%",
						press: function () {
							oDialog.close();
							if (fnCallbackLeft === undefined) {
								return;
							} else {
								fnCallbackLeft();
							}
						},
						type: bConfirmationDialog ? sap.m.ButtonType.Accept : sap.m.ButtonType.Default
					}),
					new Button({
						text: bConfirmationDialog ? oViewController.getResourceBundle().getText("BtnNo") : sBtnLeft,
						width: bConfirmationDialog ? "45%" : "30%",
						press: function () {
							oDialog.close();
							if (fnCallbackRight === undefined) {
								return;
							} else {
								fnCallbackRight();
							}
						},
						type: bConfirmationDialog ? sap.m.ButtonType.Reject : sap.m.ButtonType.Default
					})
				],
				afterClose: function () {
					oDialog.destroy();
				}
			});
			oDialog.open();
			return oDialog;
		}
	};
});