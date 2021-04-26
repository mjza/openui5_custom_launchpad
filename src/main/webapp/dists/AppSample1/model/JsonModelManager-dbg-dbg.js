sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function (BaseObject, Filter, FilterOperator, JSONModel) {
	"use strict";
	return BaseObject.extend("com.mjzsoft.QuestionnaireBuilder.model.JsonModelManager", {

		sModelName: "",
		sModelPath: "",

		/** 
		 * creates JsonModel manager for crud operations
		 * @param {string} sModelName name of model
		 * @param {string} sModelPath sPath without begining slash
		 * @param {function} fnComparator comparator for model items
		 */
		constructor: function (sModelName, sModelPath, fnComparator) {
			this.sModelName = sModelName;
			this.sModelPath = sModelPath;

			this._aMiddlewareChangeLog = {};
			this._aMiddlewareChangeLog[sModelName] = {
				aDeletedItems: [],
				aUpdatedItems: [],
				aCreatedItems: [],
				fnComparator: fnComparator
			};
		},

		/** 
		 * creates the model on controller
		 * @param {sap.ui.core.mvc.Controller} oController for access to view and models
		 */
		createModel: function (oController) {
			this._aOriginalData = [];

			var oTemp = {};
			var oModel = new JSONModel(oTemp);

			oTemp[this.sModelPath] = [];
			this._aOriginalData[this.sModelName] = jQuery.extend(true, [], oTemp[this.sModelPath]);

			oController.getView().setModel(oModel, this.sModelName);
		},

		/** 
		 * return model name of current JsonModelManager instance
		 * @returns {string} model name
		 */
		getModelName: function () {
			return this.sModelName;
		},

		/** 
		 * updates the model data and sets it as original
		 * @param {sap.ui.core.mvc.Controller} oController for access to view and models
		 * @param {array} aData entries
		 * @private
		 */
		_setData: function (oController, aData) {
			var oTemp = {};
			oTemp[this.sModelPath] = aData;
			this._aOriginalData[this.sModelName] = jQuery.extend(true, [], oTemp);

			oController.getView().getModel(this.sModelName).setData(oTemp);
		},

		/** 
		 * updates the JsonModel data by request from backend
		 * @param {sap.ui.core.mvc.Controller} oController for access to view and models
		 * @param {array} aFilters array on filters for data request
		 * @param {boolean} bReset just reset data without request
		 */
		updateData: function (oController, aFilters, bReset) {
			if (bReset) {
				this.resetChanges(oController);
				this._setData(oController, []);
			} else {
				var filters = [];
				if (aFilters) {
					if (Array.isArray(aFilters)) {
						filters = aFilters;
					} else {
						filters.push(aFilters);
					}
				}

				var oDataModel = oController.getView().getModel();
				var sPath = "/" + this.sModelPath;

				oDataModel.read(sPath, {
					filters: filters,
					success: function (oData, oResponse) {
						this.resetChanges(oController);
						this._setData(oController, oData.results);
					}.bind(this)
				});
			}
		},

		/** 
		 * reset the model to original state
		 * @param {sap.ui.core.mvc.Controller} oController for access to view and models
		 */
		resetChanges: function (oController) {
			oController.getView().getModel(this.sModelName).setData(this._aOriginalData[this.sModelName]);
			this._aMiddlewareChangeLog[this.sModelName] = {
				aDeletedItems: [],
				aUpdatedItems: [],
				aCreatedItems: [],
				fnComparator: this._aMiddlewareChangeLog[this.sModelName].fnComparator
			};
		},

		/** 
		 * adds new entries to the JsonModel
		 * @param {sap.ui.core.mvc.Controller} oController for access to view and models
		 * @param {array} aData new entries
		 */
		addToMiddlewareJsonModel: function (oController, aData) {
			var oTemp = oController.getView().getModel(this.sModelName).getData();
			if (oTemp[this.sModelPath].length > 0) {
				oTemp[this.sModelPath] = oTemp[this.sModelPath].concat(aData);
			} else {
				oTemp[this.sModelPath] = aData;
			}
			this._updateMiddlewareLog(this.sModelName, "Create", aData);

			oController.getView().getModel(this.sModelName).setData(oTemp);
			oController.getView().getModel(this.sModelName).refresh(true);
		},

		/** 
		 * updates the entry, if it is not new
		 * @param {object} oEntry JsonModel entry
		 */
		updateEntry: function (oEntry) {
			if (parseInt(oEntry.Id, 10) > 0) {
				this._updateMiddlewareLog(this.sModelName, "Update", [oEntry]);
			}
		},

		/** 
		 * removes selected entries from JsonModel
		 * @param {sap.ui.core.mvc.Controller} oController for access to view and models
		 * @param {sap.m.Table} oTable table
		 */
		deleteFromJsonModel: function (oController, oTable) {
			var aSelectedContexts = oTable.getSelectedContexts();

			var aSelectedItems = [];
			for (var i = 0; i < aSelectedContexts.length; i++) {
				var oObject = aSelectedContexts[i].getObject();
				aSelectedItems.push(oObject);
			}

			var aToKeepData = jQuery.extend(true, [], this._getCurrentElemets(oController));
			for (var n = 0; n < aSelectedItems.length; n++) {
				var oObjectA = aSelectedItems[n];
				for (var j = 0; j < aToKeepData.length; j++) {
					var oObjectB = aToKeepData[j];
					if (this._aMiddlewareChangeLog[this.sModelName].fnComparator(oObjectA, oObjectB) === true) {
						aToKeepData.splice(j, 1);
						this._updateMiddlewareLog(this.sModelName, "Delete", [oObjectA]);

						break;
					}
				}
			}

			oTable.removeSelections();

			var oTemp = {};
			oTemp[this.sModelPath] = aToKeepData;
			oController.getView().getModel(this.sModelName).setData(oTemp);
			oController.getView().getModel(this.sModelName).refresh(true);
		},

		/** 
		 * removes items from JsonModel
		 * @param {sap.ui.core.mvc.Controller} oController for access to view and models
		 * @param {array} aItems items to delete from model
		 */
		deleteItemsFromModel: function (oController, aItems) {
			var aToKeepData = jQuery.extend(true, [], this._getCurrentElemets(oController));
			for (var n = 0; n < aItems.length; n++) {
				var oObjectA = aItems[n];
				for (var j = 0; j < aToKeepData.length; j++) {
					var oObjectB = aToKeepData[j];
					if (this._aMiddlewareChangeLog[this.sModelName].fnComparator(oObjectA, oObjectB) === true) {
						aToKeepData.splice(j, 1);
						this._updateMiddlewareLog(this.sModelName, "Delete", [oObjectA]);
	
						break;
					}
				}
			}

			var oTemp = {};
			oTemp[this.sModelPath] = aToKeepData;
			oController.getView().getModel(this.sModelName).setData(oTemp);
			oController.getView().getModel(this.sModelName).refresh(true);
		},

		/** 
		 * updates entries state in Log
		 * @param {string} sJsonModelName name of model
		 * @param {string} sActionType Create, Update, Delete
		 * @param {array} aItems occured entries
		 */
		_updateMiddlewareLog: function (sJsonModelName, sActionType, aItems) {
			var aDeletedItems = this._aMiddlewareChangeLog[sJsonModelName].aDeletedItems,
				aUpdatedItems = this._aMiddlewareChangeLog[sJsonModelName].aUpdatedItems,
				aCreatedItems = this._aMiddlewareChangeLog[sJsonModelName].aCreatedItems,
				fnComparator = this._aMiddlewareChangeLog[sJsonModelName].fnComparator;
			for (var i = 0; i < aItems.length; i++) {
				var bFlagC = this._removeObjFromArray(aItems[i], aCreatedItems, fnComparator),
					bFlagU = this._removeObjFromArray(aItems[i], aUpdatedItems, fnComparator),
					bFlagD = this._removeObjFromArray(aItems[i], aDeletedItems, fnComparator);

				if (sActionType === "Delete") {
					if (bFlagC) { // if it is a new element just removing from the aCreated is enough
						continue;
					} else { // if updated we don't need that update log
						aDeletedItems.push(aItems[i]);
					}
				} else if (sActionType === "Update") {
					if (bFlagC) {
						aCreatedItems.push(aItems[i]);
					} else {
						aUpdatedItems.push(aItems[i]);
					}
				} else if (sActionType === "Create") {
					if (bFlagU || bFlagD) { // if it is updated or if it is recently deleted 
						aUpdatedItems.push(aItems[i]); // then just put it under the update
					} else {
						aCreatedItems.push(aItems[i]);
					}
				}
			}
		},

		/** 
		 * removes an item from array
		 * @param {object} oItem entry
		 * @param {array} aArray list of entries
		 * @param {function} fnComparator entries comparator
		 * @returns {boolean} true - item was removed, false - item in list not found
		 */
		_removeObjFromArray: function (oItem, aArray, fnComparator) {
			for (var i = 0; i < aArray.length; i++) {
				if (typeof fnComparator === "function") {
					if (fnComparator(oItem, aArray[i]) === true) {
						aArray.splice(i, 1);
						return true;
					}
				}
			}
			return false;
		},

		/** 
		 * get current entries in model
		 * @param {sap.ui.core.mvc.Controller} oController for access to view and models
		 * @returns {array} entries
		 * @private
		 */
		_getCurrentElemets: function (oController) {
			var oTemp = oController.getView().getModel(this.sModelName).getData();
			return oTemp[this.sModelPath];
		},

		getDeletedItems: function () {
			return this._aMiddlewareChangeLog[this.sModelName].aDeletedItems;
		},

		getUpdatedItems: function () {
			return this._aMiddlewareChangeLog[this.sModelName].aUpdatedItems;
		},

		getCreatedItems: function () {
			return this._aMiddlewareChangeLog[this.sModelName].aCreatedItems;
		}
	});
});