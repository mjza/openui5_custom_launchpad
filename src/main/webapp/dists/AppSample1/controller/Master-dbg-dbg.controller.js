sap.ui.define([
	"./BaseController",
	"../utils/Utils",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/m/MessageToast",
	"../model/individualFormatter" /*It is needed, otherwise in the xml view it is not accessible*/
], function (BaseController, Utils, formatter, JSONModel, Filter, FilterOperator, Device, MessageToast) {
	"use strict";

	return BaseController.extend("com.mjzsoft.QuestionnaireBuilder.controller.Master", {

		/**
		 * The formatter object which is used in the xml view for formatting the outputs!
		 */
		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit: function () {
			//generate and set the viewModel
			this.setModel(this._initViewModel(), "masterView");

			// init the validator
			this.initiateValidator();

			var oEventBus = sap.ui.getCore().getEventBus();
			// by save of new question in ObjectDetail
			oEventBus.subscribe("_formChange", this._onFormChange, this);
			// by F5 call with opened ObjectDetail or Detail. Subscribtion will be removed after first call
			oEventBus.subscribe("_refreshMasterSelection", "formId", this._refreshMasterSelection, this);
			// by closing of Detail view
			oEventBus.subscribe("_deselectMasterSelection", "detailClose", this._deselectMasterSelection, this);

			// listen to route match
			this.getRouter().getRoute("master").attachMatched(this._onMasterMatched, this);
		},

		/** 
		 * lifecycle event
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onAfterRendering: function (oEvent) {
			this.bindOnChangeToInputs("fieldGroupItem");
			this.getValidator().removeAllMessages();
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
		/* Internal methods                                     	   */
		/* =========================================================== */

		/** 
		 * Generates the model for the related view.
		 * @returns {sap.ui.model.json.JSONModel} the created JSON model
		 */
		_initViewModel: function () {
			return new JSONModel({
				delay: 0,
				masterCounterTitle: "...",
				showNoDataMessage: false,
				groupBy: "None",
				busy: false,
				allResources: "",
				enableDelete: false,
				selectedItem: null
			});
		},

		/** 
		 * Set the layout property of the FCL control
		 * Fires as soon as the master view url is matched.
		 * @function
		 * @private
		 * @param {sap.ui.base.Event} oEvent the route match event 
		 */
		_onMasterMatched: function (oEvent) {
			if (!this.getOwnerComponent().getCurrentUser() || !this.getOwnerComponent().getCurrentUser().admin) {
				this.getRouter().navTo("notAllowed", {}, true);
				this.getModel("appView").setProperty("/layout", "OneColumn");
			} else {
				var oAppViewModel = this.getAppViewModel();
				oAppViewModel.setProperty("/flexBoxDirection", "Row");
				oAppViewModel.setProperty("/layout", "OneColumn");
				oAppViewModel.setProperty("/datesChanged", false);
				this._deselectMasterSelection();
			}
		},

		/** 
		 * Eventbus handler for event bus "_formChange".
		 * Updates tiles in the master page.
		 * @param {string} sChannel the channel name
		 * @param {string} sEvent the event bus name
		 * @param {object} oData the passed data via event registery
		 */
		_onFormChange: function (sChannel, sEvent, oData) {
			var oListView = this.getView().byId("flexboxId");

			// if data is not ready, register a listerner to do the job later
			oListView.getBinding("items").attachEventOnce("dataReceived", function () {
				var aItems = oListView.getItems();
				this._setSelectedItem(aItems, oData.formId);
			}.bind(this));
			oListView.getBinding("items").refresh();

			// View has been bound, therefore, remove subscription from event bus.
			sap.ui.getCore().getEventBus().unsubscribe("_refreshMasterSelection", "formId", this._refreshMasterSelection, this);
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
			var oCurItem = aItems.find(function (oItem) {
				var sPath = oItem.getBindingContext().sPath;
				var oForm = this.getView().getModel().getProperty(sPath);
				return oForm.Id === sFormId;
			}.bind(this));

			if (oCurItem) {
				this._selectMasterSelection(oCurItem);
			} else {
				// The passed item was not found. 
				// Thus, close the detail view.
				var oAppViewModel = this.getAppViewModel();
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
				oItem.removeStyleClass("mjzsoftSelectedTileItem");
			});
			var oViewModel = this.getModel("masterView");
			oViewModel.setProperty("/enableDelete", false);
			oViewModel.setProperty("/selectedItem", null);
		},

		/** 
		 * Add selected state to passed item.
		 * @private
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 */
		_selectMasterSelection: function (oItem) {
			oItem.addStyleClass("mjzsoftSelectedTileItem");
			this._scrollToSelectedTile(oItem);

			var oViewModel = this.getModel("masterView");
			oViewModel.setProperty("/enableDelete", true);
			oViewModel.setProperty("/selectedItem", oItem);
		},

		/** 
		 * Scroll to the item. 
		 * @private
		 * @param {sap.ui.core.Element} oItem the intended item to scroll to 
		 */
		_scrollToSelectedTile: function (oItem) {
			var oScrollContainer = this.getView().byId("masterScrollContainer");
			setTimeout(function (_oScrollContainer, _oItem) { // eslint-disable-line
				try {
					_oScrollContainer.scrollToElement(_oItem);
				} catch (e) {
					// Do nothing
				}
			}.bind(this, oScrollContainer, oItem), 10);
		},

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail: function (oItem) {
			var bReplace = !Device.system.phone;
			// set the layout property of FCL control to show two columns
			var oAppViewModel = this.getAppViewModel();
			oAppViewModel.setProperty("/layout", "TwoColumnsMidExpanded");

			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("Id")
			}, bReplace);
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {array} aFilters list of filters for FlexBox
		 * @private
		 */
		_applyFilterSearch: function (aFilters) {
			this.getRouter().navTo("master", {}, true);
			var filters = [];
			if (aFilters && aFilters.length > 0) {
				filters = aFilters;
			}
			// update list binding
			var list = this.getView().byId("flexboxId");
			list.getBinding("items").filter(filters);
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {array} aFilters list of filters for FlexBox
		 * @private
		 */
		_applyFilterSearchIcons: function (aFilters) {
			var filters = [];
			if (aFilters && aFilters.length > 0) {
				filters = aFilters;
			}
			// update list binding
			var list = sap.ui.getCore().byId("iconDialog");
			list.getBinding("items").filter(filters);
		},

		/* =========================================================== */
		/* Event handlers                                              */
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
			oViewModel.setProperty("/masterCounterTitle", this.getResourceBundle().getText("TxtNumberResources", [oListBinding.getLength()]));

			if (oListBinding.getLength() === 0) {
				oViewModel.setProperty("/showNoDataMessage", true);
			} else {
				oViewModel.setProperty("/showNoDataMessage", false);
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
		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
				return;
			}
			var filters = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				filters.push(new Filter("Name", FilterOperator.Contains, sQuery));
			}
			this._applyFilterSearch(filters);
		},

		/**
		 * Refresh the list when user removes all search string 
		 * @param {sap.ui.base.Event} oEvent search data
		 */
		onSearchLiveChange: function (oEvent) {
			if (oEvent.getParameters().newValue.length === 0) {
				this.onSearch(oEvent);
			}
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oListView = this.getView().byId("flexboxId");
			oListView.getBinding("items").refresh();
		},

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
		onPressItem: function (oEvent) {
			if (this.getView().getModel("appView").getProperty("/editMode")) {
				MessageToast.show(this.getResourceBundle().getText("MsgEditStateOn"));
			} else {
				var bReplace = !Device.system.phone;
				var oCurItem = oEvent.getSource();
				var oBindingContextPath = oCurItem.getBindingContext().sPath;

				this._deselectMasterSelection();
				this._selectMasterSelection(oCurItem);

				var oAppViewModel = this.getAppViewModel();
				oAppViewModel.setProperty("/flexBoxDirection", "Column");
				oAppViewModel.setProperty("/layout", "TwoColumnsMidExpanded");

				var oObject = this.getModel().getProperty(oBindingContextPath);
				this.getRouter().navTo("object", {
					objectId: oObject.Id
				}, bReplace);
			}
		},

		/** 
		 * button press event to crete new form
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onCreateFromBtnPress: function (oEvent) {/*
			var oContext = this.getModel().createEntry("/FormSet", {
				properties: {
					IconId: "IC1",
					Deleted: false,
					Icon: {
						Id: "IC1",
						Source: "sap-icon://building"
					}
				}
			});*/
			if (!this._oCreateFormDialog) {
				this._oCreateFormDialog = sap.ui.xmlfragment("com.mjzsoft.QuestionnaireBuilder.view.fragment.AddForm", this);
				this.getView().addDependent(this._oCreateFormDialog);
			}
			
			
			var oFragModel = new JSONModel();
			oFragModel.setData({
				IconId: "IC1",
				IconSrc: "sap-icon://building"
			});
			//oFragModel.setData(this.getView().getModel().getProperty(oContext.getPath()));
			this._oCreateFormDialog.setModel(oFragModel, "oFragViewModel");
			
			sap.ui.getCore().byId("SaveBtnId").setEnabled(false);
			this._oCreateFormDialog.getModel("appView").setProperty("/viewIcon", true);
			this._oCreateFormDialog.getModel("appView").setProperty("/CreateEditSurveyTitle",
				this.getResourceBundle().getText("CreateNewSurveyTitle"));
			this._oCreateFormDialog.open();
		},

		/** 
		 * button press event to delete a form
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onDeleteFromBtnPress: function (oEvent) {
			var oViewModel = this.getModel("masterView");
			var oItem = oViewModel.getProperty("/selectedItem");

			if (oItem) {
				var oItemObject = this.getModel().getProperty(oItem.getBindingContext().sPath);
				var oBundle = this.getResourceBundle();
				Utils.showDialog(this, oBundle.getText("masterTitDeleteForm"), oBundle.getText("masterSureDeleteForm", [oItemObject.Name]),
					this.onDeleteForm.bind(this), true, undefined, oBundle.getText("BtnNo"), oBundle.getText("BtnYes"));
			}
		},

		onDeleteForm: function () {
			var oViewModel = this.getModel("masterView");
			var oItem = oViewModel.getProperty("/selectedItem");

			if (oItem) {
				var oDataModel = this.getModel();
				var sFormPath = oItem.getBindingContext().sPath;
				var oItemObject = oDataModel.getProperty(sFormPath);

				var sGroupId = "mjzsoft_update_" + new Date().getTime();
				oDataModel.setDeferredGroups([sGroupId]);

				// we not delete items, we only set property deleted to true
				oItemObject.Deleted = true;
				oItemObject = this.getBatchObject(oItemObject, "Form");

				oDataModel.update(sFormPath, oItemObject, {
					groupId: sGroupId
				});

				oDataModel.submitChanges({
					groupId: sGroupId,
					success: function () {
						oDataModel.setDeferredGroups([]);

						MessageToast.show(this.getResourceBundle().getText("MsgSuccessDelete"));
						this.getView().byId("flexboxId").getBinding("items").refresh(true);

						var oAppViewModel = this.getAppViewModel();
						oAppViewModel.setProperty("/flexBoxDirection", "Row");
						oAppViewModel.setProperty("/layout", "OneColumn");
						oViewModel.setProperty("/enableDelete", false);
					}.bind(this),
					error: function () {
						oDataModel.setDeferredGroups([]);
					}
				});
			}
		},

		/* =========================================================== */
		/* Functions for Dialog Fragment                               */
		/* =========================================================== */

		/** 
		 * button press event to cancel cretion of new form
		 */
		onCancelForm: function () {
			this.getAppViewModel().setProperty("/datesChanged", false);
			if (this._oCreateFormDialog && this._oCreateFormDialog.isOpen()) {
				this._oCreateFormDialog.close();
			}
		},

		/** 
		 * button press event to save new form
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onSaveForm: function (oEvent) {
			var oAppViewModel = this.getAppViewModel();
			oAppViewModel.setProperty("/datesChanged", false);
			this.getModel("masterView").setProperty("/busy", true);

			var oDateTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance();

			var oForm = this._oCreateFormDialog.getModel("oFragViewModel").getData();
			oForm = this.getBatchObject(oForm, "Form");
			oForm.ValidFrom = oDateTimeFormat.parse(sap.ui.getCore().byId("startDateTime").getValue());
			oForm.ValidTo = oDateTimeFormat.parse(sap.ui.getCore().byId("endDateTime").getValue());

			var oDataModel = this.getModel();
			oDataModel.setUseBatch(true);

			oDataModel.create("/FormSet", oForm, {
				success: function (_oData, _oResponse) {
					this.getModel("masterView").setProperty("/busy", false);

					MessageToast.show(this.getResourceBundle().getText("MsgToastSuccess"));

					// close Dialog
					this._oCreateFormDialog.close();

					// open detail view
					oAppViewModel.setProperty("/flexBoxDirection", "Column");
					oAppViewModel.setProperty("/layout", "TwoColumnsMidExpanded");
					this.getRouter().navTo("object", {
						objectId: _oData.Id
					});

					// set new added form as selected
					var oListView = this.getView().byId("flexboxId");
					// we have to refresh data, to get new item in list, so attach "dataReceived" event
					oListView.getBinding("items").attachEventOnce("dataReceived", function () {
						var aItems = oListView.getItems();
						this._setSelectedItem(aItems, _oData.Id);
					}.bind(this));

					// refresh the data
					this.onRefresh();
				}.bind(this),
				error: function (oError) {
					this.getModel("masterView").setProperty("/busy", false);

					MessageToast.show(this.getResourceBundle().getText("MsgToastError"));

					// close Dialog
					this._oCreateFormDialog.close();
				}.bind(this)
			});
		},

		/** 
		 * AddForm dialog 'afterClose' event
		 */
		onAfterCloseDialog: function () {
			if (this._oCreateFormDialog) {
				this._oCreateFormDialog.destroy();
				this._oCreateFormDialog = null;
			}
		},

		/** 
		 * event triggered by changing of start date
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onStartDateChange: function (oEvent) {
			this.getAppViewModel().setProperty("/datesChanged", true);
			this.getValidator().validate(sap.ui.getCore().byId("startDateTime"));
			this.createFormInputsValidation();
		},

		/** 
		 * event triggered by changing of end date
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onEndDateChange: function (oEvent) {
			this.getAppViewModel().setProperty("/datesChanged", true);
			this.createFormInputsValidation();
		},

		onSwitchChange: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oModel = oBindingContext.getModel();
			var sBindingPath = oBindingContext.getPath() + "/Universal";

			oModel.setProperty(sBindingPath, oEvent.getSource().getState());
		},

		/** 
		 * validation of new form creation
		 */
		createFormInputsValidation: function () {
			var oStart = sap.ui.getCore().byId("startDateTime"),
				oEnd = sap.ui.getCore().byId("endDateTime"),
				sTitle = sap.ui.getCore().byId("titleId").getValue();

			if (sTitle.length === 0 || oStart.getValue().length === 0 || oStart.getValueState() === "Error" ||
				oEnd.getValue().length === 0 || oEnd.getValueState() === "Error") {
				sap.ui.getCore().byId("SaveBtnId").setEnabled(false);
			} else {
				sap.ui.getCore().byId("SaveBtnId").setEnabled(true);
			}
		},

		/** 
		 * event triggered by each change on title of new form
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onCreateFormTitleLiveChange: function (oEvent) {
			this.createFormInputsValidation();
		},

		/*
		 * When user tries to change the icon of the new form 
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onIconPress: function (oEvent) {
			if (!this._IconSelectorDialog) {
				this._IconSelectorDialog = sap.ui.xmlfragment("com.mjzsoft.QuestionnaireBuilder.view.fragment.DialogIconSelector", this);
				this.getView().addDependent(this._IconSelectorDialog);
				this._IconSelectorDialog.setModel(this.getView().getModel());
			}
			this._IconSelectorDialog.open();
		},

		/*
		 * When the icon select dialog is closed.
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		handleCloseIcon: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts.length > 0) {
				this._oCreateFormDialog.getModel("oFragViewModel").setProperty("/IconSrc", aContexts[0].getObject().Source);
				this._oCreateFormDialog.getModel("oFragViewModel").setProperty("/IconId", aContexts[0].getObject().Id);
			}
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefreshIcons: function () {
			var oListView = this.getView().byId("flexboxId");
			oListView.getBinding("items").refresh();
		},

		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
		handleSearchIcon: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefreshIcons();
				return;
			}
			var filters = [];
			var sQuery = oEvent.getParameter("value");
			if (sQuery) {
				filters.push(new Filter("Name", FilterOperator.Contains, sQuery));
			}
			this._applyFilterSearchIcons(filters);
		},

		/**
		 * Refresh the list when user removes all search string 
		 * @param {sap.ui.base.Event} oEvent search data
		 */
		liveSearchIcon: function (oEvent) {
			if (oEvent.getParameter("value").length === 0) {
				this.handleSearchIcon(oEvent);
			}
		}
	});
});