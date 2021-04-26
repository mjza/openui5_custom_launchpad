sap.ui.define([
	"sap/m/Wizard"
], function (Wizard) {
	"use strict";

	// https://github.com/SAP/openui5/blob/master/src/sap.m/src/sap/m/Wizard.js
	return Wizard.extend("com.mjzsoft.Survey.control.InfiniteWizard", {

		renderer: {},

		/**
		 * Checks whether the maximum step count is reached.
		 * We extended this number to 1000 as it is limited to 8 in the original code. 
		 * @returns {boolean} True if the max step count is reached
		 * @private
		 */
		_isMaxStepCountExceeded: function () {
			var iStepCount = this._getStepCount();
			if (this.getEnableBranching()) {
				return false;
			}
			return iStepCount >= 1000;
		},

		/**
		 * Checks whether the minimum step count is reached.
		 * We reduced this number to 1 as its minimum is 3 in the original code. 
		 * @returns {boolean} True if the min step count is reached
		 * @private
		 */
		_isMinStepCountReached: function () {
			var iStepCount = this._getStepCount();
			return iStepCount >= 1;
		}
	});
});