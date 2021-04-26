/*global sap */
sap.ui.define([
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType"
], function (Message, MessageType) {
	"use strict";
	/**
	 * @name        nl.qualiture.plunk.demo.utils.Validator
	 *
	 * @class       
	 * @classdesc   Validator class.<br/>
	 *
	 * @version     Oktober 2015
	 * @author      Robin van het Hof
	 */
	var Validator = function () {
		this._isValid = true;
		this._isValidationPerformed = false;
		this._aMessages = [];
		this._oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
		this._oMessageManager = sap.ui.getCore().getMessageManager();
	};
	/**
	 * Returns true _only_ when the form validation has been performed, and no validation errors were found
	 * @memberof nl.qualiture.plunk.demo.utils.Validator
	 *
	 * @returns {boolean}
	 */
	Validator.prototype.isValid = function () {
		return this._isValidationPerformed && this._isValid;
	};
	/**
	 * Recursively validates the given oControl and any aggregations (i.e. child controls) it may have
	 * @memberof nl.qualiture.plunk.demo.utils.Validator
	 *
	 * @param {(sap.ui.core.Control|sap.ui.layout.form.FormContainer|sap.ui.layout.form.FormElement)} oControl - The control or element to be validated.
	 * @return {boolean} whether the oControl is valid or not.
	 */
	Validator.prototype.validate = function (oControl) {
		this._isValid = true;
		this._validate(oControl);
		return this.isValid();
	};
	/**
	 * Recursively validates the given oControl and any aggregations (i.e. child controls) it may have
	 * @memberof nl.qualiture.plunk.demo.utils.Validator
	 *
	 * @param {(sap.ui.core.Control|sap.ui.layout.form.FormContainer|sap.ui.layout.form.FormElement)} oControl - The control or element to be validated.
	 */
	Validator.prototype._validate = function (oControl) {
		this._removeMessagesOf(oControl);
		var aPossibleAggregations = ["items", "content", "form", "formContainers", "formElements", "fields", "cells"],
			aControlAggregation = null,
			oControlBinding = null,
			aValidateProperties = ["value", "selectedKey", "text", "dateValue"], // yes, I want to validate Select and Text controls too
			isValidatedControl = false,
			oExternalValue, oInternalValue,
			i, j;
		// only validate controls and elements which have a 'visible' property
		if (oControl instanceof sap.ui.core.Control ||
			oControl instanceof sap.ui.layout.form.FormContainer ||
			oControl instanceof sap.ui.layout.form.FormElement) {
			// only check visible controls (invisible controls make no sense checking)
			if (oControl.getVisible()) {
				// check control for any properties worth validating 
				for (i = 0; i < aValidateProperties.length; i += 1) {
					var sProperty = aValidateProperties[i];
					if (oControl.getBinding(sProperty)) {
						// check if a data type exists (which may have validation constraints)
						// https://openui5.hana.ondemand.com/api/sap.ui.model.type.String
						if (oControl.getBinding(sProperty).getType()) {
							// try validating the bound value
							try {
								oControlBinding = oControl.getBinding(sProperty);
								oExternalValue = oControl.getProperty(sProperty);
								oInternalValue = oControlBinding.getType().parseValue(oExternalValue, oControlBinding.sInternalType);
								oControl.getBinding(sProperty).getType().validateValue(oInternalValue);
							}
							// catch any validation errors
							catch (ex) {
								this._isValid = false;
								var sText = (typeof oControl.getValueStateText === "function") ? oControl.getValueStateText() : undefined,
									oMessage = new Message({
										message: (typeof sText === "string" && sText.trim().length > 0) ? sText : ex.message,
										type: MessageType.Error,
										target: "/" + oControl.getId() + "/" + sProperty,
										processor: this._oMessageProcessor
									});
								this._aMessages[oControl.getId()] = oMessage;
								this._oMessageManager.addMessages(oMessage);
							}
							isValidatedControl = true;
						} else if (oControl instanceof sap.m.InputBase && oControl.getRequired()) {
							oExternalValue = oControl.getProperty(sProperty);
							if (!oExternalValue || (typeof oExternalValue === "string" && oExternalValue.trim().length === 0)) {
								this._isValid = false;
								oControlBinding = oControl.getBinding(sProperty);
								sText = (typeof oControl.getValueStateText === "function") ? oControl.getValueStateText() : null;
								oMessage = new Message({
									message: sText,
									type: MessageType.Error,
									target: "/" + oControl.getId() + "/" + sProperty,
									processor: this._oMessageProcessor
								});
								this._aMessages[oControl.getId()] = oMessage;
								this._oMessageManager.addMessages(oMessage);
							}
							isValidatedControl = true;
						}
					}
				}
				// if the control could not be validated, it may have aggregations
				if (!isValidatedControl) {
					for (i = 0; i < aPossibleAggregations.length; i += 1) {
						aControlAggregation = oControl.getAggregation(aPossibleAggregations[i]);
						if (aControlAggregation) {
							// generally, aggregations are of type Array
							if (aControlAggregation instanceof Array) {
								for (j = 0; j < aControlAggregation.length; j += 1) {
									this._validate(aControlAggregation[j]);
								}
							}
							// ...however, with sap.ui.layout.form.Form, it is a single object *sigh*
							else {
								this._validate(aControlAggregation);
							}
						}
					}
				}
			}
		}
		this._isValidationPerformed = true;
	};
	Validator.prototype._removeMessagesOf = function (oControl) {
		if (this._aMessages[oControl.getId()]) {
			sap.ui.getCore().getMessageManager().removeMessages([this._aMessages[oControl.getId()]]);
			if (typeof oControl.setValueState === "function") {
				oControl.setValueState(sap.ui.core.ValueState.None);
			}
			delete this._aMessages[oControl.getId()];
		}
	};
	//remove all registered messages
	Validator.prototype.removeAllMessages = function () {
		sap.ui.getCore().getMessageManager().removeAllMessages();
		for (var sKey in this._aMessages) {
			if (sKey && this._aMessages[sKey]) {
				sap.ui.getCore().getMessageManager().removeMessages(this._aMessages[sKey]);
				var oControl = sap.ui.getCore().byId(sKey);
				if (oControl && typeof oControl.setValueState === "function") {
					oControl.setValueState(sap.ui.core.ValueState.None);
				}
			}
		}
		this._aMessages = [];
	};
	return Validator;
});