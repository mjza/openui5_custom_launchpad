sap.ui.define([
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Button",
	"sap/ui/core/ValueState"
], function (Dialog, Text, Button, ValueState) {

	"use strict";

	return {
		//returns a Dialog
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
		},

		//returns a Dialog
		showNormalDialog: function (oViewController, sTitle, oValueState, aMessageVars, fnCallback, sBeginBtnText, sEndBtnText) {
			var oDialog = new Dialog({
				title: sTitle,
				type: sap.m.DialogType.Message,
				state: oValueState,
				content: new Text({
					text: aMessageVars
				}),
				buttons: [
					new Button({
						text: sBeginBtnText,
						width: sEndBtnText === "" ? "90%" : "40%",
						press: function () {
							oDialog.close();
						},
						type: sap.m.ButtonType.Transparent
					}),
					new Button({
						text: sEndBtnText,
						visible: sEndBtnText === "" ? false : true,
						width: "40%",
						press: function () {
							oDialog.close();
							if (fnCallback === undefined) {
								return;
							} else {
								fnCallback();
							}
						}
					})
				],
				afterClose: function () {
					oDialog.destroy();
				}
			});
			oDialog.open();
			return oDialog;
		},

		//Online Service
		readData: function (oModel, sEntitySet, oUrlParams) {
			var oPromise = jQuery.Deferred();
			
			oModel.read(sEntitySet, {
				urlParameters: oUrlParams,
				success: oPromise.resolve,
				error: oPromise.reject
			});

			return oPromise;
		},

		//Online-Service
		submitChanges: function (oModel, mParams) {
			var oPromise = jQuery.Deferred();

			oModel.submitChanges(jQuery.extend({}, mParams, {
				success: oPromise.resolve,
				error: oPromise.reject
			}));
			return oPromise;
		},

		update: function (oModel, sPath, oItem) {
			var oPromise = jQuery.Deferred();

			oModel.update(sPath, oItem, {
				success: oPromise.resolve,
				error: oPromise.reject
			});
			return oPromise;
		}
	};
});