sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},

		/**
		 * Provides table mode based on passed value.
		 * If the value is true or 1 then it is single select, otherwise multi select.
		 *
		 * @public
		 * @param {boolean} bValue value is used for formatting
		 * @returns {string} passed table mode
		 */
		tableModeDetailView: function (bValue) {
			if (bValue === "1" || bValue === 1 || bValue === "true" || bValue === true) {
				return "MultiSelect";
			} else {
				return "SingleSelectMaster";
			}
		},
		
		/**
		 * Provides column list type based on passed value.
		 * If the value is true or 1 then it is Inactive, otherwise Navigation.
		 *
		 * @public
		 * @param {boolean} bValue value is used for formatting
		 * @returns {string} passed table mode
		 */
		tableColumnType: function (bValue) {
			if (bValue === "1" || bValue === 1 || bValue === "true" || bValue === true) {
				return "Inactive";
			} else {
				return "Navigation";
			}
		},

		/**
		 * Provides table mode based on passed value.
		 * If the value is true or 1 then it is single select, otherwise multi select.
		 *
		 * @public
		 * @param {boolean} bValue value is used for formatting
		 * @returns {string} passed table mode
		 */
		tableModeObjectDetailView: function (bValue) {
			if (bValue === "1" || bValue === 1 || bValue === "true" || bValue === true) {
				return "MultiSelect";
			} else {
				return "SingleSelectMaster";
			}
		},

		/**
		 * Provides the suitable icon name based on question type
		 *
		 * @public
		 * @param {string} sQuestionType the type of the question
		 * @returns {string} sapui5 icon
		 */
		getQuestionIcon: function (sQuestionType) {
			switch (sQuestionType) {
			case "QT1":
				return "sap-icon://favorite";
			case "QT2":
				return "sap-icon://complete";
			case "QT3":
				return "sap-icon://menu";
			case "QT4":
				return "sap-icon://multi-select";
			case "QT5":
				return "sap-icon://question-mark";
			case "QT6":
				return "sap-icon://request";
			case "QT7":
				return "sap-icon://drop-down-list";
			default:
				return null;
			}
		},

		/**
		 * Provides suitable icon for mandatory questions 
		 *
		 * @public
		 * @param {boolean} bValue value is used for formatting
		 * @returns {string} provided icon name
		 */
		getMandatoryIcon: function (bValue) {
			if (bValue === "1" || bValue === 1 || bValue === "true" || bValue === true) {
				return "sap-icon://overlay";
			} else {
				return "sap-icon://circle-task";
			}
		},

		/**
		 * Provides suitable tooltip for mandatory icon of questions 
		 *
		 * @public
		 * @param {boolean} bValue value is used for formatting
		 * @returns {string} provided tooltip from i18n
		 */
		getMandatoryTooltip: function (bValue) {
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			if (bValue === "1" || bValue === 1 || bValue === "true" || bValue === true) {
				return oResourceBundle.getText("isMandatoryQuestion");
			} else {
				return oResourceBundle.getText("isNotMandatoryQuestion");
			}
		},

		/**
		 * Provides suitable color for mandatory icon of questions 
		 *
		 * @public
		 * @param {boolean} bValue value is used for formatting
		 * @returns {string} provided icon color
		 */
		getMandatoryIconColor: function (bValue) {
			if (bValue === "1" || bValue === 1 || bValue === "true" || bValue === true) {
				return "Negative";
			} else {
				return "Default";
			}
		},

		/**
		 * Checks whether the start date is after end date or before today or not.
		 * If it is before today or after end date then will return 'Error' as value state otherwise 'None'!
		 *
		 * @public
		 * @param {Date} oStartDate the start date
		 * @param {Date} oEndDate the end date
		 * @param {boolean} bChanged if it is changed then it is true
		 * @returns {string} provided value state
		 */
		checkStartDate: function (oStartDate, oEndDate, bChanged) {
			var today = new Date();
			today.setHours(0, 0, 0, 0);
			if (bChanged === true && (oStartDate > oEndDate || oStartDate < today)) {
				return "Error";
			} else {
				return "None";
			}
		},

		/**
		 * Checks whether the end date is before start date or not.
		 * If it is before start date then will return 'Error' as value state otherwise 'None'!
		 *
		 * @public
		 * @param {Date} oStartDate the start date
		 * @param {Date} oEndDate the end date
		 * @param {boolean} bChanged if it is changed then it is true
		 * @returns {string} provided value state
		 */
		checkEndDate: function (oStartDate, oEndDate, bChanged) {
			if (bChanged === true && oStartDate > oEndDate) {
				return "Error";
			} else {
				return "None";
			}
		},

		/**
		 * Converts boolean string to boolean type 
		 *
		 * @public
		 * @param {boolean} bValue value that must be formatted
		 * @returns {boolean} true or false based on passed value 
		 */
		booleanValue: function (bValue) {
			if (bValue === "1" || bValue === 1 || bValue === "true" || bValue === true) {
				return true;
			} else {
				return false;
			}
		},

		/** 
		 * empty field validation
		 * @param {string} sValue current value of Input
		 * @returns {sap.ui.core.ValueState} state of field
		 */
		notEmptyValidation: function (sValue) {
			if (sValue && sValue.length > 0) {
				return "None";
			} else {
				return "Error";
			}
		},

		/** 
		 * checks if mandatory field is visible or not based on question type
		 * @param {string} sQtypeId current question type
		 * @returns {boolean} visibility of field
		 */
		isMandatoryVisible: function (sQtypeId) {
			return sQtypeId !== "QT1" && sQtypeId !== "QT2";
		}
	};
}, false);