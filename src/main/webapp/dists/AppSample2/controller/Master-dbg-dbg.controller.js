/*global history */
sap.ui.define([
	"com/mjzsoft/QuestionnaireStatistics/controller/BaseController",
	"com/mjzsoft/QuestionnaireStatistics/model/models",
	"com/mjzsoft/QuestionnaireStatistics/model/formatter",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	"com/mjzsoft/QuestionnaireStatistics/model/individualFormatter" /*It is needed, otherwise in the xml view it is not accessible*/
], function (BaseController, models, formatter, History, Device) {
	"use strict";

	return BaseController.extend("com.mjzsoft.QuestionnaireStatistics.controller.Master", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit: function () {
			//generate viewModel
			var oViewModel = models.initMasterViewModel(this);
			//set viewModel
			this.setModel(oViewModel, "masterView");

			this.getRouter().getRoute("master").attachMatched(this._onMasterMatched, this);

			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("_refreshMasterSelection", "formId", this._refreshMasterSelection, this);
			oEventBus.subscribe("_deselectMasterSelection", "detailClose", this._deselectMasterSelection, this);
		},

		/** 
		 * lifetime event called when view is closed
		 * when application is leaved, unsubscribe all events
		 */
		onExit: function () {
			var oEventBus = sap.ui.getCore().getEventBus();

			oEventBus.unsubscribe("_refreshMasterSelection", "formId", this._refreshMasterSelection, this);
			oEventBus.unsubscribe("_deselectMasterSelection", "detailClose", this._deselectMasterSelection, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/** 
		 * Is called as soon as the dataReceived event of the list happen.
		 * Tries to update the number of the forms in the view header. 
		 * 'dataReceived' event handler on FlexBox.
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onFormsReceived: function (oEvent) {
			var oListBinding = oEvent.getSource(),
				oViewModel = this.getModel("masterView");

			oViewModel.setProperty("/masterCounterTitle",
				this.getResourceBundle().getText("TxtNumberResources", [oListBinding.getLength()]));
			if (oListBinding.getLength() === 0) {
				oViewModel.setProperty("/showNoDataMessage", true);
			} else {
				oViewModel.setProperty("/showNoDataMessage", false);
			}
		},

		/**
		 * enter press event for search term in list of surveys
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 */
		handleSearch: function (oEvent) {
			this.onSearch(oEvent, "query");
		},

		/**
		 * live search after each change of search term
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 */
		liveSearch: function (oEvent) {
			if (oEvent.getParameters().newValue.length === 0) {
				this.onSearch(oEvent, "newValue");
			}
		},

		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
		onSearch: function (oEvent, sParameter) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.getView().byId("flexboxId").getBinding("items").refresh();
				return;
			}

			var sQuery = oEvent.getParameter(sParameter);

			var filters = [];
			if (sQuery) {
				filters = [new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery)];
			}

			// update list binding
			var list = this.getView().byId("flexboxId");
			list.getBinding("items").filter(filters);
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will navigate to the shell home
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},

		/**
		 * Event handler for the item press event
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 */
		onPressItem: function (oEvent) {
			var bReplace = !Device.system.phone,
				oBindingContext = oEvent.getSource().getBindingContext();

			var oObject = this.getModel().getProperty(oBindingContext.sPath);

			this.getRouter().navTo("object", {
				objectId: oObject.Id
			}, bReplace);

			var aFlexBoxItems = oEvent.getSource().getParent().getItems();
			aFlexBoxItems.forEach(function (oItem) {
				oItem.removeStyleClass("selectedTileItem");
			});

			oEvent.getSource().addStyleClass("selectedTileItem");
			this.getModel("appView").setProperty("/flexBoxDirection", "Column");
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/** 
		 * event fired after pattern match on master view
		 */
		_onMasterMatched: function () {
			if (!this.getOwnerComponent().getCurrentUser() || !this.getOwnerComponent().getCurrentUser().admin) {
				this.getRouter().navTo("notAllowed", {}, true);
				this.getModel("appView").setProperty("/layout", "OneColumn");
			} else {
				this.getModel().refresh(true);

				//Set the layout property of the FCL control to 'OneColumn'
				this.getModel("appView").setProperty("/flexBoxDirection", "Row");
				this.getModel("appView").setProperty("/layout", "OneColumn");
			}
		},

		/** 
		 * Eventbus handler for event bus "_refreshMasterSelection".
		 * Updates tiles in the master page.
		 * @param {string} sChannel the channel name
		 * @param {string} sEvent the event bus name
		 * @param {object} oData the passed data via event registery
		 */
		_refreshMasterSelection: function (sChannel, sEvent, oData) {
			var oListView = this.getView().byId("flexboxId");
			var aItems = oListView.getItems();
			if (aItems.length === 0) {
				// if data is not ready, register a listerner to do the job later
				oListView.getBinding("items").attachEventOnce("dataReceived", function () {
					aItems = oListView.getItems();
					this._setSelectedItem(aItems, oData.formId);
				}.bind(this));
			} else {
				this._setSelectedItem(aItems, oData.formId);
			}
			// View has been bound, therefore, remove subscription from event bus.
			sap.ui.getCore().getEventBus().unsubscribe("_refreshMasterSelection", "formId", this._refreshMasterSelection, this);
		},

		/** 
		 * This function selects the visiting item in the list. 
		 * If item not found -> set view to OneColumn
		 * Is triggered only from detail and objectDetail by initializing and via event bus. 
		 * @private
		 * @param {array} aItems list of table items
		 * @param {string} sFormId id of selected item
		 */
		_setSelectedItem: function (aItems, sFormId) {
			// convert FormId to int
			sFormId = parseInt(sFormId, 10);

			var oCurItem = aItems.find(function (oItem) {
				var sPath = oItem.getBindingContext().sPath;
				var oForm = this.getView().getModel().getProperty(sPath);
				return oForm.Id === sFormId;
			}.bind(this));

			var oAppViewModel = this.getAppViewModel();
			if (oCurItem) {
				oCurItem.addStyleClass("selectedTileItem");
				oAppViewModel.setProperty("/flexBoxDirection", "Column");
			} else {
				// The passed item was not found. 
				// Thus, close the detail view.
				oAppViewModel.setProperty("/flexBoxDirection", "Row");
				oAppViewModel.setProperty("/layout", "OneColumn");
				oAppViewModel.setProperty("/datesChanged", false);
			}
		},

		/** 
		 * Removes selected state from items.
		 * Eventbus handler for event bus "_deselectMasterSelection".
		 * @private
		 */
		_deselectMasterSelection: function () {
			var oListView = this.getView().byId("flexboxId");
			var aItems = oListView.getItems();
			aItems.forEach(function (oItem) {
				oItem.removeStyleClass("selectedTileItem");
			});
		}

	});
});