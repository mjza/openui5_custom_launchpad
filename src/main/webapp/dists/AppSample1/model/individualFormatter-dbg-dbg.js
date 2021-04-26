sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Filter, FilterOperator) {
	"use strict";

	return {

		/**
		 * Returns number of not deleted questions of a form
		 *
		 * @public
		 * @param {array} aQuestions just expanded item passed to have the binding 
		 * @returns {number} number of not deleted questions
		 */
		formQuestionsCounter: function (aQuestions) {
			var oItem = this.getParent();
			var sPath = oItem.getBindingContext().getPath() + "/Questions";
			var oBindings = oItem.getModel().bindList(sPath, null, null, [new Filter({
				path: "Deleted",
				operator: FilterOperator.EQ,
				value1: false
			})]);
			return oBindings.getLength();
		}
	};
}, /*For exporting*/ true); // <-- Enables accessing this module via global name "com.mjzsoft.QuestionnaireBuilder.model.individualFormatter"