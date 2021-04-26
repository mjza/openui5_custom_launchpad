sap.ui.define([
	"sap/m/RatingIndicator",
	"sap/m/Switch",
	"sap/m/RadioButton",
	"sap/m/CheckBox",
	"sap/m/Input",
	"sap/m/TextArea",
	"sap/m/Select",
	"sap/m/Panel"
], function (RatingIndicator, Switch, RadioButton, CheckBox, Input, TextArea, Select, Panel) {
	"use strict";
	
	// An object that contains definition of supported controlls
	const _CONTROLLS = {
		_RATINGINDICATOR: "sap.m.RatingIndicator",
		_SWITCH: "sap.m.Switch",
		_RADIOBUTTON: "sap.m.RadioButton",
		_CHECKBOX: "sap.m.CheckBox",
		_INPUT: "sap.m.Input",
		_TEXTAREA: "sap.m.TextArea",
		_SELECT: "sap.m.Select"
	};

	return {

		/** 
		 * Generates returns a control based on passed UI5 class. 
		 * @param {string} sUI5Class The UI5 class full path of the control
		 * @param {object} oParams The parameters for initiating a control 
		 * @param {string} sRegex The regex for controlling user answer
		 * @param {sap.m.Wizard} oWiazrd The parent wizard
		 * @param {boolean} bMandatory If the control is needed to be mandatory
		 * @returns {sap.ui.core.Control} The generated control
		 */
		/* eslint-disable complexity */
		generateNewControl: function (sUI5Class, oParams, sRegex, oWiazrd, bMandatory) {
			switch (sUI5Class) {
			case _CONTROLLS._RATINGINDICATOR:
				var oRatingInd;
				if (oParams.editable === false) {
					oRatingInd = new RatingIndicator("RATINGINDICATOR" + this.getRandomMathString(), oParams);
					return this.addStyleClassToRatingControl(oRatingInd);
				} else {
					oRatingInd = new RatingIndicator("RATINGINDICATOR" + this.getRandomMathString(), oParams);
					oRatingInd.attachChange(this.onAttachChangeValue.bind(this));
					return oRatingInd;
				}
			case _CONTROLLS._SWITCH:
				return new Switch("SWITCH" + this.getRandomMathString(), oParams);
			case _CONTROLLS._RADIOBUTTON:
				return new RadioButton("RADIOBUTTON" + this.getRandomMathString(), oParams);
			case _CONTROLLS._CHECKBOX:
				return new CheckBox("CHECKBOX" + this.getRandomMathString(), oParams);
			case _CONTROLLS._INPUT:
				if (oParams.editable === false && (!oParams.value || !oParams.value.length)) {
					return null;
				} else {
					var oInput = new Input("INPUT" + this.getRandomMathString(), oParams);
					oInput.addStyleClass("mjzsoftTransparentBackground");
					if (sRegex !== null && sRegex !== undefined) {
						oInput.attachChange(function () {
							var sValue = oInput.getValue(),
								sValueState = "None";
							oWiazrd.setShowNextButton(true);
							var regE = new RegExp([sRegex]);
							if (!sValue.match(regE)) {
								sValueState = "Error";
								oWiazrd.setShowNextButton(false);
							}
							if (bMandatory === false && sValue.length === 0) {
								sValueState = "None";
								oWiazrd.setShowNextButton(true);
							}
							oInput.setValueState(sValueState);
						});
					}
					return oInput;
				}
			case _CONTROLLS._TEXTAREA:
				if (oParams.editable === false && (!oParams.value || !oParams.value.length)) {
					return null;
				} else if (oParams.editable === false && (oParams.value || oParams.value.length)) {
					var oTextArea = new TextArea("TEXTAREA" + this.getRandomMathString(), oParams),
						iLength = oTextArea.getValue().length;
					oTextArea.addStyleClass("mjzsoftTransparentBackground");
					if (iLength < 30) {
						oTextArea.setRows(1);
					} else if (iLength < 60) {
						oTextArea.setRows(2);
					} else if (iLength < 100) {
						oTextArea.setRows(3);
					} else if (iLength < 150) {
						oTextArea.setRows(5);
					}
					return oTextArea;
				} else {
					var oNormalTextArea = new TextArea("TEXTAREA" + this.getRandomMathString(), oParams);
					oNormalTextArea.addStyleClass("mjzsoftTransparentBackground");
					return oNormalTextArea;
				}
			case _CONTROLLS._SELECT:
				return new Select("SELECT" + this.getRandomMathString(), oParams);
			}
			return null;
		},
		
		/** 
		 * Gets a field group id and extract relevant fields 
		 * @param {array} aFieldGroups List of field groups
		 * @returns {array} An array of extracted sapui5 elements
		 */
		getRelevantFields: function (aFieldGroups) {
			var i, oField, sControlName, aExtractedFields = [];
			for (i = 0; i < aFieldGroups.length; i++) {
				oField = aFieldGroups[i];
				sControlName = oField.getMetadata().getName();
				switch (sControlName) {
				case _CONTROLLS._SWITCH:
					aExtractedFields.push(oField);
					break;
				case _CONTROLLS._RADIOBUTTON:
					aExtractedFields.push(oField);
					break;
				case _CONTROLLS._CHECKBOX:
					aExtractedFields.push(oField);
					break;
				case _CONTROLLS._INPUT:
					aExtractedFields.push(oField);
					break;
				case _CONTROLLS._TEXTAREA:
					aExtractedFields.push(oField);
					break;
				case _CONTROLLS._SELECT:
					aExtractedFields.push(oField);
					break;
				case _CONTROLLS._RATINGINDICATOR:
					aExtractedFields.push(oField);
				}
			}
			return aExtractedFields;
		},

		/** 
		 * Generates and returns a random number as a string
		 * @returns {string} a random number that changed to string
		 */
		getRandomMathString: function () {
			return Math.random().toString();
		},

		/** 
		 * Assign different colors from red to dark green to 5 stars indicators
		 * @param {sap.m.RatingIndicator} oRatingIndicator The control that we have to apply the color to 
		 * @returns {sap.m.RatingIndicator} returns the passed oRatingIndicator for chaining actions
		 */
		addStyleClassToRatingControl: function (oRatingIndicator) {
			var iValue = parseInt(oRatingIndicator.getValue(), 0);
			oRatingIndicator.removeStyleClass("redStar");
			oRatingIndicator.removeStyleClass("orangeStar");
			oRatingIndicator.removeStyleClass("yellowStar");
			oRatingIndicator.removeStyleClass("lightGreenStar");
			oRatingIndicator.removeStyleClass("darkGreenStar");
			if (iValue === 1) {
				oRatingIndicator.addStyleClass("redStar");
			} else if (iValue === 2) {
				oRatingIndicator.addStyleClass("orangeStar");
			} else if (iValue === 3) {
				oRatingIndicator.addStyleClass("yellowStar");
			} else if (iValue === 4) {
				oRatingIndicator.addStyleClass("lightGreenStar");
			} else if (iValue === 5) {
				oRatingIndicator.addStyleClass("darkGreenStar");
			}
			return oRatingIndicator;
		},

		/** 
		 * The event handler for changing event of the RatingIndicator
		 * @param {sap.ui.base.Event} oEvent The event object matches the change event of the RatingIndicator
		 */
		onAttachChangeValue: function (oEvent) {
			var oRatingIndicator = oEvent.getSource();
			this.addStyleClassToRatingControl(oRatingIndicator);
		},

		/** 
		 * Generates and returns the suitable Parameter object for the control
		 * @param {string} sUI5Class The UI5 class full path of the control
		 * @param {string} sAnswer Indicates if the user provided an answer for the question or not
		 * @param {boolean} bEditable true if the item must be editable, false otherwise
		 * @param {sap.ui.core.mvc.Controller} oController The parent controller
		 * @returns {object} The generated param object 
		 */
		/* eslint-disable complexity */
		generateParametersForControl: function (sUI5Class, sAnswer, bEditable, oController) {
			var oBundle = oController.getResourceBundle();
			switch (sUI5Class) {
			case _CONTROLLS._RATINGINDICATOR:
				return {
					maxValue: 5,
					value: sAnswer === undefined ? 0 : parseFloat(sAnswer),
					fieldGroupIds: bEditable ? "fieldGroupSurvey" : "",
					editable: bEditable
				};
			case _CONTROLLS._SWITCH:
				return {
					state: sAnswer === "1" ? true : false,
					fieldGroupIds: bEditable ? "fieldGroupSurvey" : "",
					enabled: bEditable,
					customTextOff: oBundle.getText("btnNo"),
					customTextOn: oBundle.getText("btnYes")
				};
			case _CONTROLLS._RADIOBUTTON:
				return {
					selected: sAnswer === "1" ? true : false,
					fieldGroupIds: bEditable ? "fieldGroupSurvey" : "",
					editable: bEditable
				};
			case _CONTROLLS._CHECKBOX:
				return {
					selected: sAnswer === "1" ? true : false,
					fieldGroupIds: bEditable ? "fieldGroupSurvey" : "",
					editable: bEditable
				};
			case _CONTROLLS._INPUT:
				return {
					value: sAnswer === undefined ? "" : sAnswer,
					fieldGroupIds: bEditable ? "fieldGroupSurvey" : "",
					editable: bEditable,
					enabled: bEditable,
					width: "80%"
				};
			case _CONTROLLS._TEXTAREA:
				return {
					value: sAnswer === undefined ? "" : sAnswer,
					fieldGroupIds: bEditable ? "fieldGroupSurvey" : "",
					editable: bEditable,
					enabled: bEditable,
					width: "80%",
					growing: true,
					rows: 10
				};
			case _CONTROLLS._SELECT:
				return {
					enabled: sAnswer === "1" ? true : false,
					editable: bEditable,
					fieldGroupIds: bEditable ? "fieldGroupSurvey" : ""
				};
			}
			return null;
		},

		/** 
		 * Generates a new UI5 panel 
		 * @param {integer} iNumber question number
		 * @param {string} sQuestion the question text 
		 * @param {arry} aContent array of the elements
		 * @returns {sap.m.Panel} The generated panel
		 */
		generateNewPanel: function (iNumber, sQuestion, aContent) {
			return new Panel({
				headerText: iNumber + ". " + sQuestion,
				content: aContent
			});
		},

		/** 
		 * Sort Based on Sequence and returns sorted set
		 * @param {array} aDataSet the passed questions for sorting
		 * @returns {array} The sorted array 
		 */
		sortDataStructure: function (aDataSet) {
			if (aDataSet.length > 0) {
				return aDataSet.sort(function(a, b) {
					if (a.Sequence < b.Sequence) {
						return -1;
					}
					if (a.Sequence > b.Sequence) {
						return 1;
					}
					return 0;
				});
			} else {
				return aDataSet;
			}
		}
	};
});