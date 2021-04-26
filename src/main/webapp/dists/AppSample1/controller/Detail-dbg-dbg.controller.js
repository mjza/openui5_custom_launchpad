sap.ui.define([
	"./BaseController",
	"../utils/Utils",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, Utils, formatter, JSONModel, MessageToast, MessageBox, Sorter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.mjzsoft.QuestionnaireBuilder.controller.Detail", {

		formatter: formatter,

		// current input for search in table
		_sCurrentSearchQuery: "",

		// UI element to improve auto scrolling to selected item
		_oScrollContainer: null,

		// form id of current bound element
		_sObjectId: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the detail controller is instantiated.
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			this.setModel(this._initViewModel(), "detailView");

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.getRouter().getRoute("object").attachBeforeMatched(this._onBeforeMatched, this);

			// init the validator
			this.initiateValidator();

			this.getValidator().removeAllMessages();

			this._resetDataSets();

			var oEventBus = sap.ui.getCore().getEventBus();
			// by save of new question in ObjectDetail
			oEventBus.subscribe("_questionCountChange", this._questionCountChange, this);
			// by F5 call with opened ObjectDetail. Subscribtion will be removed after first call
			oEventBus.subscribe("_refreshDetail", "objectId", this._refreshDetail, this);
			// by F5 call with opened ObjectDetail and not create mode. Subscribtion will be removed after first call
			oEventBus.subscribe("_refreshDetailSelection", "questionId", this._refreshDetailSelection, this);
			// by closing of ObjectDetail view
			oEventBus.subscribe("_deselectDetailSelection", "objectDetailClose", this._deselectDetailSelection, this);

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		/**
		 * Called when the view rendering is finished.
		 */
		onAfterRendering: function () {
			var oPage = this.byId("formPage");
			this._oScrollContainer = this.byId(oPage.getId() + "-page-vertSB");
		},

		/** 
		 * lifetime event called when view is closed
		 * when application is leaved, unsubscribe all events
		 */
		onExit: function () {
			var oEventBus = sap.ui.getCore().getEventBus();

			oEventBus.unsubscribe("_questionCountChange", this._questionCountChange, this);
			oEventBus.unsubscribe("_refreshDetail", "objectId", this._refreshDetail, this);
			oEventBus.unsubscribe("_refreshDetailSelection", "objectId", this._refreshDetailSelection, this);
			oEventBus.unsubscribe("_deselectDetailSelection", "objectDetailClose", this._deselectDetailSelection, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/** 
		 * event called before rebind the table
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onBeforeRebindTable: function (oEvent) {
			var oBindingParams = oEvent.getParameter("bindingParams");

			if (this._sObjectId) {
				var oFilter = this._getInitialFilter();
				oBindingParams.filters.push(oFilter);
			}
			oBindingParams.sorter.push(new Sorter("Sequence", false));
		},

		/** 
		 * edit press event
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onPressEdit: function (oEvent) {
			this.getValidator().removeAllMessages();
			this.getModel("detailView").setProperty("/editMode", true);
			this.getModel("appView").setProperty("/editMode", true);
			this.getAppViewModel().setProperty("/layout", "TwoColumnsMidExpanded");
		},

		/** 
		 * cancel press event
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onPressCancel: function (oEvent) {
			var bChanged = this.getModel("detailView").getProperty("/changed");

			if (bChanged || this._aDeletedQuestions.length > 0 || this._aUpdatedQuestionIds.length > 0) {
				var oBundle = this.getResourceBundle();
				Utils.showDialog(this, oBundle.getText("TitDialogCancel"), oBundle.getText("TxtDialogCancel"), this.onCancelDialog.bind(this),
					true, undefined, oBundle.getText("BtnNo"), oBundle.getText("BtnYes"));
			} else {
				this.onCancelDialog();
			}
		},

		/** 
		 * callback function for cancel event
		 */
		onCancelDialog: function () {
			MessageToast.show(this.getResourceBundle().getText("MsgToastCanceled"));
			this.getModel("detailView").setProperty("/editMode", false);
			this.getModel("appView").setProperty("/editMode", false);
			this.getView().unbindElement();

			this._rebindView();
			var oTable = this.getView().byId("tableQuestions");
			for (var i = 0; i < this._aDeletedItems; i++) {
				oTable.addItem(this._aDeletedItems[i]);
			}
			this._resetDataSets();
			// remove selection
			this.getModel("detailView").setProperty("/selectedItemId", "");
		},

		/** 
		 * Event-Handler for saving the changes
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onPressSaveEdit: function (oEvent) {
			var bChanged = this.getModel("detailView").getProperty("/changed");

			if (bChanged || this._aDeletedQuestions.length > 0 || this._aUpdatedQuestionIds.length > 0) {
				var oBundle = this.getResourceBundle();
				Utils.showDialog(this, oBundle.getText("saveMsg"), oBundle.getText("saveBtnMsg"), this.onSaveDialog.bind(this),
					true, undefined, oBundle.getText("BtnNo"), oBundle.getText("BtnYes"));
			} else {
				this.getModel("detailView").setProperty("/editMode", false);
				this.getModel("appView").setProperty("/editMode", false);
			}
		},

		/** 
		 * search event on table
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onSearch: function (oEvent) {
			var aFilters = ["Question"];
			this._sCurrentSearchQuery = oEvent.getParameter("query");
			this.getView().byId("tableQuestions").setBusy(true);
			this._onSearchinTable(this._sCurrentSearchQuery, aFilters);
		},

		/** 
		 * live change event on table
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onSearchLiveChange: function (oEvent) {
			var aFilters = ["Question"];
			// make live search only if search field is empty
			if (oEvent.getParameters().newValue.length === 0) {
				this._sCurrentSearchQuery = "";
				this._onSearchinTable(this._sCurrentSearchQuery, aFilters);
			}
		},

		/** 
		 * event handler for add button press
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onCreateBtnPress: function (oEvent) {
			this._resetAppViewModel("ThreeColumnsEndExpanded");
			this.getRouter().navTo("createObject", {
				objectId: this._sObjectId
			});
			this.getModel("detailView").setProperty("/selectedItemId", "");
		},

		/** 
		 * event handler for delete button press
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onDeleteBtnPress: function (oEvent) {
			var oTable = this.getView().byId("tableQuestions"),
				aSelectedContexts = oTable.getSelectedContexts();
			if (aSelectedContexts.length === 0 && oTable.getItems().length > 0) {
				MessageBox.error(this.getResourceBundle().getText("atLeastSellectOneItemToAction"), {
					icon: MessageBox.Icon.ERROR,
					title: this.getResourceBundle().getText("errorHeader"),
					actions: [MessageBox.Action.OK]
				});
				return;
			} else if (oTable.getItems().length > 0) {
				var oQuestionsJsonModel = oTable.getModel("QuestionsJsonModel"),
					aSelecteds = oTable.getSelectedItems();

				aSelecteds.forEach(function (oItem) {
					var oItemObject = oItem.getBindingContext("QuestionsJsonModel").getObject();
					if (oItemObject.Id < 0) {
						var aTableItems = oQuestionsJsonModel.getData().QuestionSet;
						for (var i = 0; i < aTableItems.length; i++) {
							if (oItemObject.Id === aTableItems[i].Id) {
								aTableItems.splice(i, 1);
							}
						}
						oTable.getBinding("items").refresh();
					} else {
						this._aDeletedQuestions.push(oItemObject);
					}
					this._aDeletedItems.push(oItem);
					oTable.removeItem(oItem);
				}.bind(this));
			}
		},

		/** 
		 * 'selectionChange' event of Table
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onTableItemPress: function (oEvent) {
			if (!this.getView().getModel("appView").getProperty("/editMode")) {
				var oListItem = oEvent.getParameter("listItem");
				if (oListItem && oListItem.getProperty("type") === "Navigation") {
					var oBindingContext = oListItem.getBindingContext("QuestionsJsonModel");
					var oTable = this.getView().byId("tableQuestions");
					var oObject = oTable.getModel("QuestionsJsonModel").getObject(oBindingContext.getPath());

					this._navFromDetailToObjectDetail(oObject.Id);
					this.getModel("detailView").setProperty("/selectedItemId", oObject.Id);
				}
			}
		},

		/** 
		 * callback funciton for saving changes
		 */
		onSaveDialog: function () {
			this.getModel("detailView").setProperty("/editMode", false);
			this.getModel("appView").setProperty("/editMode", false);
			if (this._sObjectId) {
				this.updateQuestions();
			}
		},

		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function () {
			var bFullScreen = this.getModel("detailView").getProperty("/fullscreen");
			this.getModel("detailView").setProperty("/fullscreen", !bFullScreen);
			if (bFullScreen) {
				this.getAppViewModel().setProperty("/fullscreen", false);
				// reset to previous layout
				this.getAppViewModel().setProperty("/layout", this.getAppViewModel().getProperty("/previousLayout"));
			} else {
				// store current layout and go full screen
				this.getAppViewModel().setProperty("/previousLayout", this.getAppViewModel().getProperty("/layout"));
				this.getAppViewModel().setProperty("/layout", "MidColumnFullScreen");
				this.getAppViewModel().setProperty("/fullscreen", true);
			}
		},

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function () {
			var oDetailViewModel = this.getModel("detailView");
			if (oDetailViewModel.getProperty("/editMode")) {
				var bChanged = oDetailViewModel.getProperty("/changed");

				if (bChanged || this._aDeletedQuestions.length > 0 || this._aUpdatedQuestionIds.length > 0) {
					var oBundle = this.getResourceBundle();
					Utils.showDialog(this, oBundle.getText("TitDialogClose"), oBundle.getText("closeViewInEditMode"), this.onCloseView.bind(this),
						true, undefined, "", "");
				} else {
					this.onCloseView();
				}
			} else {
				sap.ui.getCore().getEventBus().publish("_deselectMasterSelection", "detailClose", {});
				oDetailViewModel.setProperty("/fullscreen", false);
				// No item should be selected on master after detail page is closed
				this.getRouter().navTo("master");
			}
		},

		/** 
		 * button event on table item to switch item with next up one
		 * @param {sap.ui.base.Event} oEvent the route match event
		 */
		tableUpBtnPress: function (oEvent) {
			this.getModel("detailView").setProperty("/changed", true);
			var oTable = this.getView().byId("tableQuestions");

			var oItem = oEvent.getSource().getBindingContext("QuestionsJsonModel").getObject();

			// find item position
			var iItemPosition = -1;
			for (var i = 0; i < oTable.getItems().length; i++) {
				if (oTable.getItems()[i].getBindingContext("QuestionsJsonModel").getObject().Id === oItem.Id) {
					iItemPosition = i;
					break;
				}
			}

			// check item position to switch
			var iIndexSwitch = iItemPosition - 1;
			if (iIndexSwitch === -1) {
				iIndexSwitch = oTable.getItems().length - 1;
			}

			var oSwitchObject = oTable.getItems()[iIndexSwitch].getBindingContext("QuestionsJsonModel").getObject();

			// update UI values
			var iTempIndex = oItem.Sequence;
			oItem.Sequence = oSwitchObject.Sequence;
			oSwitchObject.Sequence = iTempIndex;

			if (!this._aUpdatedQuestionIds.includes(oItem.Id)) {
				this._aUpdatedQuestionIds.push(oItem.Id);
			}
			if (!this._aUpdatedQuestionIds.includes(oSwitchObject.Id)) {
				this._aUpdatedQuestionIds.push(oSwitchObject.Id);
			}

			// refresh UI
			oTable.getBinding("items").refresh(true);
		},

		/** 
		 * button event on table item to switch item with next down one
		 * @param {sap.ui.base.Event} oEvent the route match event
		 */
		tableDownBtnPress: function (oEvent) {
			this.getModel("detailView").setProperty("/changed", true);
			var oTable = this.getView().byId("tableQuestions");

			var oItem = oEvent.getSource().getBindingContext("QuestionsJsonModel").getObject();

			// find item position
			var iItemPosition = -1;
			for (var i = 0; i < oTable.getItems().length; i++) {
				if (oTable.getItems()[i].getBindingContext("QuestionsJsonModel").getObject().Id === oItem.Id) {
					iItemPosition = i;
					break;
				}
			}

			// check item position to switch
			var iIndexSwitch = iItemPosition + 1;
			if (iIndexSwitch >= oTable.getItems().length) {
				iIndexSwitch = 0;
			}

			var oSwitchObject = oTable.getItems()[iIndexSwitch].getBindingContext("QuestionsJsonModel").getObject();

			// update UI values
			var iTempIndex = oItem.Sequence;
			oItem.Sequence = oSwitchObject.Sequence;
			oSwitchObject.Sequence = iTempIndex;

			if (!this._aUpdatedQuestionIds.includes(oItem.Id)) {
				this._aUpdatedQuestionIds.push(oItem.Id);
			}
			if (!this._aUpdatedQuestionIds.includes(oSwitchObject.Id)) {
				this._aUpdatedQuestionIds.push(oSwitchObject.Id);
			}

			// refresh UI
			oTable.getBinding("items").refresh(true);
		},

		/* =========================================================== */
		/* Internal methods                                     	   */
		/* =========================================================== */

		/** 
		 * returns the initial model for view
		 * @returns {sap.ui.model.json.JSONModel} model for view
		 */
		_initViewModel: function () {
			return new JSONModel({
				busy: false,
				tableBusy: false,
				delay: 0,
				editMode: false,
				selectedItemId: ""
			});
		},

		/** 
		 * save the changes
		 */
		updateQuestions: function () {
			var oQuestionsJsonModel = this.getView().byId("tableQuestions").getModel("QuestionsJsonModel"),
				aTableItems = oQuestionsJsonModel.getData().QuestionSet.filter(function (item) {
					return item.FormId === this._sObjectId;
				}.bind(this));

			this.iNumberOfDoneRequests = aTableItems.length;

			if (this.iNumberOfDoneRequests > 0) {
				var aDeletedIds = [],
					oDataModel = this.getModel(),
					sGroupId = "mjzsoftemail" + new Date().getTime();

				oDataModel.setUseBatch(true);
				oDataModel.setDeferredGroups([sGroupId]);

				// Delete
				// using OData for delete
				this._aDeletedQuestions.forEach(function (oItem) {
					var oEntry = this.getBatchObject(oItem, "Question");
					var sPath = "/" + oDataModel.createKey("QuestionSet", oEntry);
					oEntry.Deleted = true;
					aDeletedIds.push(oEntry.Id);
					this._updateRelatedItem(sPath, oEntry, sGroupId, this._resetDataSets());
					this.getModel().read("/OptionSet", {
						filters: [new Filter("QuestionId", FilterOperator.EQ, oEntry.Id)],
						sorters: [new Sorter("Sequence", false)],
						success: function (oData2, oResponse) {
							oData2.results.forEach(function (oOption) {
								sPath = "/" + oDataModel.createKey("OptionSet", oOption);
								oOption.Deleted = true;
								this._updateRelatedItem(sPath, oEntry, sGroupId, this._resetDataSets());
							}.bind(this));
						}.bind(this),
						error: function (oError) {
							MessageToast.show(this.getResourceBundle().getText("errorHeader"));
						}
					});
				}.bind(this));

				// Update  & Create
				aTableItems.forEach(function (oItem) {
					var oEntry = this.getBatchObject(oItem, "Question");
					if (oEntry.Id < 0) {
						this.iNumberOfDoneRequests--;
						delete oEntry.Id;
						oDataModel.create("/QuestionSet", oEntry, {
							success: function (_oData, _oResponse) {
								oEntry.Id = _oData.Id;
								this.getModel("detailView").setProperty("/busy", false);
							}.bind(this),
							error: function (oError) {
								MessageToast.show(this.getAppViewModel().getProperty("/errorCreationMessage"));
								this.getModel("detailView").setProperty("/busy", false);
							}.bind(this)
						});
					} else if (!aDeletedIds.includes(oEntry.Id) && this._aUpdatedQuestionIds.includes(oEntry.Id)) {
						var sPath = "/" + oDataModel.createKey("QuestionSet", oEntry);
						this._updateRelatedItem(sPath, oEntry, sGroupId, this._resetDataSets());
					}
				}.bind(this));

				oDataModel.submitChanges({
					groupId: sGroupId,
					success: function () {
						this._requestQuestions();

						sap.ui.getCore().getEventBus().publish("_formChange", {
							formId: this._sObjectId
						});
					}.bind(this)
				});
			} else {
				this._resetDataSets();
			}
		},

		/** 
		 * callback function to close the view
		 */
		onCloseView: function () {
			this.getModel("appView").setProperty("/editMode", false);

			sap.ui.getCore().getEventBus().publish("_deselectMasterSelection", "detailClose", {});
			this.getModel("detailView").setProperty("/fullscreen", false);
			// No item should be selected on master after detail page is closed
			this.getRouter().navTo("master");
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/** 
		 * creates update request for item to backend
		 * @param {string} sPath path for item
		 * @param {object} oItem item to update
		 * @param {string} sGroupId change group id
		 * @param {function} fnCallback callback function
		 */
		_updateRelatedItem: function (sPath, oItem, sGroupId, fnCallback) {
			var oDataModel = this.getModel(),
				sChangeSetId = "mjzsoftaddu" + new Date().getTime() * (1 + Math.random());
			oDataModel.update(sPath, oItem, {
				groupId: sGroupId,
				changeSetId: sChangeSetId,
				success: function (oData, oResponse) {
					this.iNumberOfDoneRequests--;
					if (typeof fnCallback === "function") {
						fnCallback(oData, oResponse);
					}
				}.bind(this),
				error: function (oError) {
					this.iNumberOfDoneRequests--;
					if (typeof fnCallback === "function") {
						fnCallback(oError);
					}
				}.bind(this)
			});
		},

		/** 
		 *  event executed as far as metadata loaded
		 */
		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");
			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		/** 
		 * Navigation to next view/ObjectDetail-View
		 * @param {string} sId id of selected item in table
		 */
		_navFromDetailToObjectDetail: function (sId) {
			//nav to Object
			this._resetAppViewModel("ThreeColumnsEndExpanded");
			this.getRouter().navTo("objectDetail", {
				objectId: this._sObjectId,
				Id: sId
			});
			this.getModel("detailView").setProperty("/selectedItemId", sId);
		},

		/** 
		 * fired before new item is bound to view
		 */
		_onBeforeMatched: function () {
			if (this.getView()) {
				this.getView().unbindElement();
				this.getView().unbindObject();
				this.getView().setBindingContext(null);
			}
			this.getAppViewModel().setProperty("/title", "");
		},

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 */
		_onObjectMatched: function (oEvent) {
			if (!this.getOwnerComponent().getCurrentUser() || !this.getOwnerComponent().getCurrentUser().admin) {
				this.getRouter().navTo("notAllowed", {}, true);
				this.getModel("appView").setProperty("/layout", "OneColumn");
			} else {
				this._sObjectId = parseInt(oEvent.getParameter("arguments").objectId, 10);
				this.getModel("detailView").setProperty("/fullscreen", false);
				this.getModel("detailView").setProperty("/editMode", false);
				this.getAppViewModel().setProperty("/layout", "TwoColumnsMidExpanded");
				this.getAppViewModel().setProperty("/datesChanged", false);
				this._rebindView();

				// refresh selection on master
				sap.ui.getCore().getEventBus().publish("_refreshMasterSelection", "formId", {
					formId: this._sObjectId
				});
			}
		},

		/** 
		 * perform search in table
		 * @param {string} sQuery search term
		 * @param {array} aSFilterNames filter property names
		 */
		_onSearchinTable: function (sQuery, aSFilterNames) {
			var oTable = this.getView().byId("tableQuestions");
			oTable.getBinding("items").filter(new Filter({
				filters: [
					this._getInitialFilter(),
					this._getSearchFilter(sQuery, aSFilterNames)
				],
				and: true
			}), sap.ui.model.FilterType.Application);
			oTable.setBusy(false);
		},

		/** 
		 * returns default filter for Questions
		 * @returns {sap.ui.model.Filter} filter for options
		 */
		_getInitialFilter: function () {
			return new Filter({
				filters: [
					new Filter("FormId", FilterOperator.EQ, this._sObjectId),
					new Filter("Deleted", FilterOperator.EQ, false)
				],
				and: true
			});
		},

		/** 
		 * combines filters with search parameter
		 * @param {string} squery search parameter
		 * @param {array} aFilters filters for search
		 * @returns {sap.ui.model.Filter} filter for options
		 */
		_getSearchFilter: function (squery, aFilters) {
			var aSearchFilters = [];
			for (var i = 0; i < aFilters.length; i++) {
				aSearchFilters.push(new Filter(aFilters[i], FilterOperator.Contains, squery));
			}
			return new Filter({
				filters: aSearchFilters,
				and: false
			});
		},

		/** 
		 * eventbus event fired to update the view
		 */
		_rebindView: function () {
			this.getModel("detailView").setProperty("/busy", true);
			this.getModel().metadataLoaded().then(function () {
				this._sObjectPath = "/" + this.getModel().createKey("FormSet", {
					Id: this._sObjectId
				});
				this._bindView(this._sObjectPath);
			}.bind(this));
		},

		/** 
		 * Eventbus handler for event bus "_questionCountChange".
		 * @param {string} sChannel channel name
		 * @param {string} sEvent event name
		 * @param {object} oData data of event
		 */
		_questionCountChange: function (sChannel, sEvent, oData) {
			this.getModel("detailView").setProperty("/selectedItemId", oData.questionId);
			this._requestQuestions();
		},

		_requestQuestions: function () {
			this.getAppViewModel().setProperty("/tableBusy", true);
			this.getModel().read("/QuestionSet", {
				urlParameters: {
					$expand: "Qtype"
				},
				filters: [this._getInitialFilter()],
				sorters: [new Sorter("Sequence", false)],
				success: function (_oData, oResponse) {
					//Create JSON Model
					var oQuestionsJsonModel = new JSONModel();
					oQuestionsJsonModel.setData({
						QuestionSet: _oData.results
					});
					this.setModel(oQuestionsJsonModel, "QuestionsJsonModel");

					this.getView().byId("smartTableQuestions").rebindTable();

					if (this._sCurrentSearchQuery.length > 0) {
						this._onSearchinTable(this._sCurrentSearchQuery, ["Question"]);
					}
					this.getAppViewModel().setProperty("/tableBusy", false);
				}.bind(this),
				error: function (oError) {
					MessageToast.show(this.getAppViewModel().getProperty("/errorHeader"));
					this.getAppViewModel().setProperty("/tableBusy", false);
				}.bind(this)
			});
		},

		/** 
		 * eventbus event fired to update the view
		 * @param {string} sChannel channel name
		 * @param {string} sEvent event name
		 * @param {object} oData data of event
		 */
		_refreshDetail: function (sChannel, sEvent, oData) {
			this._sObjectId = oData.objectId;

			this.getModel().metadataLoaded().then(function () {
				this._sObjectPath = this.getModel().createKey("FormSet", {
					Id: this._sObjectId
				});
				this._bindView("/" + this._sObjectPath);
			}.bind(this));

			// view is bound. remove subscription
			sap.ui.getCore().getEventBus().unsubscribe("_refreshDetail", "objectId", this._refreshDetail, this);
		},

		/** 
		 * eventbus event fired to update selected item
		 * @param {string} sChannel channel name
		 * @param {string} sEvent event name
		 * @param {object} oData data of event
		 */
		_refreshDetailSelection: function (sChannel, sEvent, oData) {
			this.getModel("detailView").setProperty("/selectedItemId", oData.questionId);

			var oTable = this.getView().byId("tableQuestions");
			var aItems = oTable.getItems();

			if (aItems.length === 0) {
				oTable.attachEventOnce("updateFinished", function () {
					var aTableItems = oTable.getItems();
					this._checkItemInit(aTableItems, oData.questionId);
				}.bind(this));
			} else {
				this._checkItemInit(aItems, oData.questionId);
			}

			// view is bound. remove subscription
			sap.ui.getCore().getEventBus().unsubscribe("_refreshDetailSelection", "questionId", this._refreshDetailSelection, this);
		},

		/** 
		 * function to check if item exist in the list. if not -> set view to TwoColumnsMidExpanded
		 * triggered only from objectDetail by initializing
		 * @param {array} aItems list of table items
		 * @param {string} sQuestionId id of searched item
		 */
		_checkItemInit: function (aItems, sQuestionId) {
			var oCurItem = aItems.find(function (oItem) {
				var sPath = oItem.getBindingContext("QuestionsJsonModel").sPath;
				var oQuestion = this.getView().getModel("QuestionsJsonModel").getProperty(sPath);
				return oQuestion.Id === sQuestionId;
			}.bind(this));

			if (oCurItem) {
				jQuery.sap.delayedCall(0, null, function () {
					if (this._oScrollContainer) {
						var oOffset = oCurItem.$().offset();
						this._oScrollContainer.setScrollPosition(oOffset.top);
					}
				}.bind(this));
			} else {
				this._resetAppViewModel("TwoColumnsMidExpanded");
			}
		},

		/** 
		 * removes selected state from items
		 */
		_deselectDetailSelection: function () {
			this.getModel("detailView").setProperty("/selectedItemId", "");
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			this.getAppViewModel().setProperty("/flexBoxDirection", "Column");
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			this.getModel("detailView").setProperty("/busy", false);
			this.getView().bindElement({
				path: sObjectPath,
				parameters: {
					"$expand": "Icon"
				},
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						this.getModel("detailView").setProperty("/busy", true);
					}.bind(this),
					dataReceived: function () {
						this.getModel("detailView").setProperty("/busy", false);
					}.bind(this)
				}
			});
		},

		/** 
		 * change event for bound element
		 */
		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				return;
			}
			var oObject = oView.getModel().getObject(oElementBinding.getPath());
			this._sObjectId = oObject.Id;

			this._requestQuestions();
		},

		/** 
		 * resets view data
		 */
		_resetDataSets: function () {
			this.getModel("detailView").setProperty("/changed", false);
			this._aDeletedQuestions = [];
			this._aUpdatedQuestionIds = [];
			this._aDeletedItems = [];
		},

		/** 
		 * updates BusyIndicator state
		 * @param {boolean} bBusy busy state
		 */
		_setViewBusy: function (bBusy) {
			if (bBusy) {
				this.getModel("detailView").setProperty("/busy", true);
				sap.ui.core.BusyIndicator.show();
			} else {
				this.getModel("detailView").setProperty("/busy", false);
				sap.ui.core.BusyIndicator.hide();
			}
		},

		/** 
		 * sets layout
		 * @param {sap.f.LayoutType} sLayoutType layout type
		 */
		_resetAppViewModel: function (sLayoutType) {
			this.getAppViewModel().setProperty("/layout", sLayoutType);
			this.getAppViewModel().setProperty("/flexBoxDirection", "Column");
		},

		/* =========================================================== */
		/* begin: Fragment controller                                  */
		/* =========================================================== */

		/**
		 * handler for saving a new form
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onEditFormBtnPress: function (oEvent) {
			if (!this._oCreateFormDialog) {
				this._oCreateFormDialog = sap.ui.xmlfragment("com.mjzsoft.QuestionnaireBuilder.view.fragment.AddForm", this);

				this.getView().addDependent(this._oCreateFormDialog);
			}
			/*
			this._oCreateFormDialog.bindElement({
				path: this._sObjectPath,
				parameters: {
					"$expand": "Icon"
				}
			});
			*/

			var oManagedForm = this.getView().getModel().getProperty(this._sObjectPath, null, true);
			var oForm = this.getBatchObject(oManagedForm, "Form");
			oForm.IconSrc = oManagedForm.Icon.Source;

			var oFragModel = new JSONModel();
			oFragModel.setData(oForm);
			this._oCreateFormDialog.setModel(oFragModel, "oFragViewModel");

			this._oCreateFormDialog.getModel("appView").setProperty("/CreateEditSurveyTitle",
				this.getResourceBundle().getText("EditSurveyTitle"));
			this._oCreateFormDialog.getModel("appView").setProperty("/viewIcon", false);
			this._oCreateFormDialog.open();
		},

		/**
		 * hander for cancel adding a form
		 */
		onCancelForm: function () {
			this.getAppViewModel().setProperty("/datesChanged", false);
			//	this.getModel().resetChanges([oContextPath + "/ValidFrom", oContextPath + "/ValidTo", oContextPath + "/Name", oContextPath + "/Universal"]);
			if (this._oCreateFormDialog) {
				if (this._oCreateFormDialog.isOpen()) {
					this._oCreateFormDialog.close();
				}
			}
		},

		/**
		 * handler for saving a form
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onSaveForm: function (oEvent) {
			this.getAppViewModel().setProperty("/datesChanged", false);

			var oDateTimeFormat = sap.ui.core.format.DateFormat.getDateTimeInstance(),
				oStart = sap.ui.getCore().byId("startDateTime").getValue(),
				oEnd = sap.ui.getCore().byId("endDateTime").getValue(),
				oStartDateTime = oDateTimeFormat.parse(oStart),
				oEndDateTime = oDateTimeFormat.parse(oEnd),
				oDataModel = this.getModel(),
				sPath = oEvent.getSource().getBindingContext().sPath,
				sGroupId = "mjzsoftadd" + new Date().getTime();

			var oForm = this._oCreateFormDialog.getModel("oFragViewModel").getData();
			oForm = this.getBatchObject(oForm, "Form");
			oForm.ValidFrom = oStartDateTime;
			oForm.ValidTo = oEndDateTime;

			oDataModel.setUseBatch(true);
			oDataModel.setDeferredGroups([sGroupId]);

			this._setViewBusy(false);

			oDataModel.update(sPath, oForm, {
				groupId: sGroupId,
				success: function () {
					MessageToast.show(this.getResourceBundle().getText("successUpdateMessage"));
					this._setViewBusy(false);

					//close Dialog
					this._oCreateFormDialog.close();

					sap.ui.getCore().getEventBus().publish("_formChange", {
						formId: this._sObjectId
					});
				}.bind(this),
				error: function (oError) {
					MessageToast.show(this.getResourceBundle().getText("MsgToastError"));
					this._setViewBusy(false);

					//close Dialog
					this._oCreateFormDialog.close();
				}.bind(this)
			});

			oDataModel.submitChanges({
				groupId: sGroupId
			});
		},

		/**
		 * close Handler for Dialog
		 */
		onAfterCloseDialog: function () {
			if (this._oCreateFormDialog) {
				this._oCreateFormDialog.destroy();
				this._oCreateFormDialog = null;
			}
		},

		/**
		 * change Handler for StartDate
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onStartDateChange: function (oEvent) {
			this.getAppViewModel().setProperty("/datesChanged", true);
			this.getValidator().validate(sap.ui.getCore().byId("startDateTime"));
			this.createFormInputsValidation();
		},

		/**
		 * change Handler for EndDate
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onEndDateChange: function (oEvent) {
			this.getAppViewModel().setProperty("/datesChanged", true);
			this.createFormInputsValidation();
		},

		onSwitchChange: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			var oModel = oBindingContext.getModel("oFragViewModel");
			var sBindingPath = oBindingContext.getPath() + "/Universal";

			oModel.setProperty(sBindingPath, oEvent.getSource().getState());
		},

		/**
		 * Validation for FormInput 
		 * @param {sap.ui.base.Event} oEvent pattern match event
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
		 * live change handler for title
		 * @param {sap.ui.base.Event} oEvent pattern match event
		 */
		onCreateFormTitleLiveChange: function (oEvent) {
			this.createFormInputsValidation();
		}
	});
});