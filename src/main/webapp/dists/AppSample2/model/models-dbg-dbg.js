sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		initEmptyJSONModel: function () {
			return new JSONModel();
		},

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createFLPModel: function () {
			var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
				bIsShareInJamActive = fnGetuser ? fnGetuser().isJamActive() : false,
				oModel = new JSONModel({
					isShareInJamActive: bIsShareInJamActive
				});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		//appViewModel
		initAppViewModel: function () {
			return new JSONModel({
				busy: true,
				FlexBoxDirection: "Row",
				delay: 0,
				layout: "OneColumn",
				previousLayout: "",
				actionButtonsInfo: {
					midColumn: {
						fullScreen: false
					}
				}
			});
		},

		//Masterview-viewModel
		initMasterViewModel: function (oViewController) {
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: oViewController.getResourceBundle().getText("masterTitleCount", [0]),
				noDataText: oViewController.getResourceBundle().getText("masterListNoDataText"),
				groupBy: "None",
				busy: false,
				FlexBoxDirection: "Row",
				allResources: ""
			});
		},

		//Detailview-viewModel
		initDetailViewModel: function () {
			return new JSONModel({
				busy: false,
				delay: 0,
				deleteBtnEnabled: false,
				tableBusy: false,
				filterBtnEnabled: true,
				groupBtnEnabled: true,
				sortBtnEnabled: true,
				bLocatioinTableVisible: false,
				bUserTableVisible: false,
				sFilter: '#Car',
				bUserTableBusy: false,
				title: "",
				LocationSearch: "",
				UserSearch: ""
			});
		},
		initObjectViewModel: function () {
			return new JSONModel({
				titleDisplay: "",
				editBtnVisible: false,
				saveBtnVisible: false,
				cancelBtnVisible: false,
				viewMode: true,
				busy: false,
				EditMode: false,
				showFooter: true,
				showAdd: false,
				title: "",
				fullscreen: false,
				validMailState: sap.ui.core.ValueState.None,
				validDisplayNameState: sap.ui.core.ValueState.None,
				image: ""
			});
		},
		initUserObjectViewModel: function () {
			return new JSONModel({
				title: "",
				viewMode: true,
				busy: false,
				icon: "",
				addMode: false,
				image: "",
				selectedKey: "1"
			});
		}
	};

});