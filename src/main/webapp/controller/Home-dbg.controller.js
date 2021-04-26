sap.ui.define([
	"com/mjzsoft/Mjzsoft0Launchpad/controller/BaseController",
	"com/mjzsoft/Mjzsoft0Launchpad/localService/mockserver",
	"sap/ui/model/json/JSONModel",
	"sap/ushell/iconfonts",
	"sap/ushell/services/AppConfiguration",
	"sap/ui/core/IconPool",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	"sap/m/ActionSheet",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/base/Log"
// eslint-disable-next-line max-params
], function (BaseController, mockserver, JSONModel, iconfonts, AppConfiguration, IconPool, Button, ButtonType, Text, ActionSheet,
	Dialog, DialogType, Log) {
	"use strict";

	return BaseController.extend("com.mjzsoft.Mjzsoft0Launchpad.controller.Home", {
		model: {
			lang: "en",
			jwtExpiry: 0,
			counter: null,
			iTimer: 0,
			sTimer: "00:00",
			oldPass: undefined,
			newPass: undefined,
			confirmNewPass: undefined,
			error: null
		},
		onInit: function () {
			var lang = sap.ui.getCore().getConfiguration().getLanguage();
			lang = lang && lang.length >= 2 ? lang.substring(0, 2) : "en";
			this.model.lang = lang;
			this.setModel(new JSONModel(this.model), "launchpadView");
			// load and register Fiori2 icon font
			iconfonts.registerFiori2IconFont();
			IconPool.addIcon("mjzsoft", "customfont", "icomoon", "e900");
			var queryString = window.location.search,
				urlParams = new URLSearchParams(queryString);
			var bWithMockServer = urlParams.get("MjzsoftWithMockServer");
			if (bWithMockServer === "true" || bWithMockServer === "1") {
				// init mock server for local testing
				mockserver.init().then(function () {
					Log.info("Mock server initiated.");
				});
				jQuery("#canvas").empty();
				var oContent = this._generateLaunchpadContent();
				oContent.placeAt("canvas", "first");
			} else {
				jQuery("#canvas").empty();
				oContent = this._generateLaunchpadContent();
				oContent.placeAt("canvas", "first");
			}
			// jwt observing
			this._readJwtExpiry();
			sap.ui.getCore().getEventBus().subscribe("JWT", "jwtChanged", this._readJwtExpiry, this);
			this.initJWTObserver();
			// https://sapui5.hana.ondemand.com/sdk/#/api/sap.ushell.services.Container%23methods/attachLogoutEvent
			sap.ushell.Container.attachLogoutEvent(this._logout.bind(this));
		},
		_readJwtExpiry: function () {
			var iExpiry = this.getOwnerComponent().getJwtAuth().getExpiryTime();
			this.getModel("launchpadView").setProperty("/jwtExpiry", iExpiry);
		},
		_generateLaunchpadContent: function () {
			// initialize the ushell sandbox component
			// clean fiori loading screen markup before placing main content
			var oContent = sap.ushell.Container.createRenderer();
			oContent.addStyleClass("sapUShellFullHeight");
			oContent.addEventDelegate({
				"onBeforeRendering": this._onBeforeLaunchpadRendering.bind(this),
				"onAfterRendering": this._onAfterLaunchpadRendering.bind(this)
			}, this);
			return oContent;
		},
		_onBeforeLaunchpadRendering: function (oEvent) {
			jQuery("#flowerCanvas").remove();
		},
		_onAfterLaunchpadRendering: function (_oEvent) {
			var oI18nModel = this.getModel("i18n");
			var oResourceBundle = this.getResourceBundle();
			var oRenderer = sap.ushell.Container.getRenderer("fiori2");
			oRenderer.setModel(this.getModel("launchpadView"), "launchpadView");
			// Adds the menu to user drop down 
			// This menu shows an imprint dialog when it is pressed 
			var oMjzsoftButton = new sap.m.Button({
				text: oResourceBundle.getText("home_companyName"),
				icon: "sap-icon://customfont/mjzsoft",
				press: function () {
					if (!this._oInfoDialog) {
						this._oInfoDialog = sap.ui.xmlfragment("infoDialog", "com.mjzsoft.Mjzsoft0Launchpad.view.dialogs.MjzsoftInfoDialog", this);
						this._oInfoDialog.setModel(oI18nModel, "i18n");
						this._oInfoDialog.open();
					} else {
						this._oInfoDialog.open();
					}
				}.bind(this)
			});
			oRenderer.showActionButton([oMjzsoftButton.getId()], false, ["home", "app"]);
			// This menu shows a reset password dialog when it is pressed 
			var oPassUpdateButton = new sap.m.Button({
				text: oResourceBundle.getText("home_updatePassword"),
				icon: "sap-icon://two-keys",
				press: function () {
					if (!this._oPassUpdateDialog) {
						this._oPassUpdateDialog = sap.ui.xmlfragment("passUpdateDialog", "com.mjzsoft.Mjzsoft0Launchpad.view.dialogs.PassUpdateDialog",
							this);
						this._oPassUpdateDialog.setModel(oI18nModel, "i18n");
						this._oPassUpdateDialog.setModel(this.getModel("launchpadView"), "launchpadView");
						this._oPassUpdateDialog.open();
						this.bindOnChangeToInputs("UpdatePass", this._oPassUpdateDialog);
					} else {
						var oViewModel = this.getModel("launchpadView");
						oViewModel.setProperty("/oldPass", undefined);
						oViewModel.setProperty("/newPass", undefined);
						oViewModel.setProperty("/confirmNewPass", undefined);
						oViewModel.setProperty("/error", null);
						this.resetAllValueStates();
						this._oPassUpdateDialog.open();
					}
				}.bind(this)
			});
			oRenderer.showActionButton([oPassUpdateButton.getId()], false, ["home", "app"]);
			//  Adds one button to the end of header for language change
			var oTimerIcon = oRenderer.addHeaderEndItem("sessionTimer", {
				icon: "sap-icon://fob-watch",
				floatingNumber: "{launchpadView>/counter}",
				press: this._showTimerMenu.bind(this)
			}, true, false);
			oTimerIcon.setModel(this.getModel("launchpadView"), "launchpadView");
			this._oTimerIcon = oTimerIcon;
			//  Adds one button to the end of header for language change
			var oLangIcon = oRenderer.addHeaderEndItem("languageMenu", {
				icon: "sap-icon://world",
				tooltip: "{launchpadView>/lang}",
				press: this._showLanguageMenu.bind(this)
			}, true, false);
			oLangIcon.setModel(this.getModel("launchpadView"), "launchpadView");
			// Adds the side column 
			// Add home button shown only when an app is openned
			var oHomeIcon = oRenderer.addToolAreaItem({
				icon: "sap-icon://home",
				tooltip: oResourceBundle.getText("home_startIcon"),
				expandable: false,
				press: function (evt) {
					var sUrl = window.location.href.split("#")[0] + "#Shell-home";
					sap.m.URLHelper.redirect(sUrl, false);
				}
			}, true, false, ["app"]);
			oHomeIcon.setModel(this.getModel("launchpadView"), "launchpadView");
			// Add icons for rest of the tiles
			var oLaunchPage = sap.ushell.Container.getService("LaunchPage");
			oLaunchPage.getCatalogs()
				.done(function (aCatalogs) {
					aCatalogs.forEach(function (oCatalog) {
						oCatalog.tiles.forEach(function (oTile) {
							var sHash = oLaunchPage.getCatalogTileTargetURL(oTile),
								sIcon = oLaunchPage.getCatalogTilePreviewIcon(oTile),
								sTitle = oLaunchPage.getCatalogTileTitle(oTile);
							if (sIcon && sHash) {
								oRenderer.addToolAreaItem({
									icon: sIcon,
									tooltip: sTitle,
									expandable: false,
									press: function (_sHash, evt) {
										var sUrl = window.location.href.split("#")[0] + _sHash;
										sap.m.URLHelper.redirect(sUrl, false);
									}.bind(this, sHash)
								}, true, false, ["home", "app"]);
							}
						});
					});
				});
			// Adds 2 button at the begining of header 
			/*var button1 = new sap.ushell.ui.shell.ShellHeadItem();
			var button2 = new sap.ushell.ui.shell.ShellHeadItem();
			oRenderer.showHeaderItem ([button1.getId(), button2.getId()], false, ["home", "app"]);*/
			// Adds subheader
			/*var bar = new sap.m.Bar({id: "testBar", contentLeft: [new sap.m.Button({text: "Test SubHeader Button",
			  press: function () {
			    sap.m.MessageToast.show("Pressed");
			  }})
			]});
			oRenderer.showSubHeader([bar.getId()], false, ["home", "app"]);*/
			// Adds footer
			/*var bar = new sap.m.Bar({contentLeft: [new sap.m.Button({text: "Test Footer Button",
				  press: function () {
				    sap.m.MessageToast.show("Pressed");
				  }})
				]});
			oRenderer.setFooter(bar);*/
			// Adds menu to setting button 
			/*var oEntry = {
				  title: "MJZSoft Co.",
				  value: function() {
				      return jQuery.Deferred().resolve("Contact us and more");
				  },
				  content: function() {
				      return jQuery.Deferred().resolve(new sap.m.Button("userPrefEntryButton", {text: "Button"}));
				  },
				  onSave: function() {
				      return jQuery.Deferred().resolve();
				  }
				  };
			oRenderer.addUserPreferencesEntry(oEntry);*/
		},

		_showLanguageMenu: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oLanguageMenu) {
				this._oLanguageMenu = this._createLanguageMenu();
			}
			if (this._oLanguageMenu.isOpen()) {
				this._oLanguageMenu.close();
			} else {
				this._oLanguageMenu.openBy(oButton);
			}
		},

		_createLanguageMenu: function () {
			var oItemTemplate = new Button({
				text: "{languages>name}",
				textDirection: {
					path: "languages>rtl",
					formatter: function (bValue) {
						return (bValue ? sap.ui.core.TextDirection.RTL : sap.ui.core.TextDirection.LTR);
					}
				},
				type: {
					path: "languages>id",
					formatter: function (sValue) {
						var sLang = sap.ui.getCore().getConfiguration().getLanguage();
						sLang = sLang && sLang.length >= 2 ? sLang.substring(0, 2) : "en";
						return (sLang === sValue ? ButtonType.Accept : ButtonType.Default);
					}
				},
				customData: [{
					Type: "sap.ui.core.CustomData",
					key: "lang",
					value: "{languages>id}" // bind custom data
				}, {
					Type: "sap.ui.core.CustomData",
					key: "rtl",
					value: "{languages>rtl}" // bind custom data
				}],
				press: function (oEvent) {
					sap.ui.core.BusyIndicator.show(1);
					var sNextLang = oEvent.getSource().data("lang");
					var sUrl = "" + window.location.href,
						sNewUrl = sUrl;
					var sRegEx = /([?&]sap-language)=([^#&]*)/g;
					var aMatches = sRegEx.exec(sUrl);
					if (aMatches && aMatches.length > 0) {
						sNewUrl = sUrl.replace(sRegEx, aMatches[1] + "=" + sNextLang);
					} else if (sUrl.indexOf("?") > 0) {
						sNewUrl = sUrl.replace("?", "?sap-language=" + sNextLang + "&");
					} else {
						sNewUrl = sUrl.replace(".html", ".html?sap-language=" + sNextLang + "&");
					}
					sap.m.URLHelper.redirect(sNewUrl, false);
				}
			});
			var oMenu = new ActionSheet({
				showCancelButton: false,
				buttons: {
					path: "languages>/",
					template: oItemTemplate,
					templateShareable: false
				}
			});
			oMenu.setModel(this.getModel("languages"), "languages");
			return oMenu;
		},

		_showTimerMenu: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oTimerMenu) {
				this._oTimerMenu = this._createTimerMenu();
			}
			if (this._oTimerMenu.isOpen()) {
				this._oTimerMenu.close();
			} else {
				this._oTimerMenu.openBy(oButton);
			}
		},

		_createTimerMenu: function () {
			var oButton = new Button({
				icon: "sap-icon://fob-watch",
				text: "{launchpadView>/sTimer}",
				type: ButtonType.Transparent,
				enabled: false,
				customData: [{
					Type: "sap.ui.core.CustomData",
					key: "timer",
					value: {
						path: "launchpadView>/iTimer",
						formatter: function (iValue) {
							if (iValue && iValue > 86400000) {
								return "Blue";
							} else if (iValue && iValue > 3600000) {
								return "Green";
							} else if (iValue && iValue > 60000) {
								return "Yellow";
							}
							return "Red";
						}
					},
					writeToDom: true
				}]
			});
			oButton.addStyleClass("mjzsoftTimerBtn");
			oButton.setModel(this.getModel("launchpadView"), "launchpadView");
			var oMenu = new ActionSheet({
				showCancelButton: false,
				buttons: [oButton]
			});
			oMenu.setModel(this.getModel("launchpadView"), "launchpadView");
			return oMenu;
		},

		initJWTObserver: function () {
			var fnInterval = setInterval(function () {
				var oViewModel = this.getModel("launchpadView");
				var now = new Date().getTime();
				var countdowntime = oViewModel.getProperty("/jwtExpiry");
				var iTimer = countdowntime - now;
				oViewModel.setProperty("/iTimer", iTimer);
				if (iTimer < 0) {
					clearInterval(fnInterval);
					oViewModel.setProperty("/counter", null);
					sap.ui.core.BusyIndicator.show(1);
					location.reload(); // eslint-disable-line sap-no-location-reload
					return;
				}
				var days = Math.floor(iTimer / 86400000);
				var hours = Math.floor((iTimer % 86400000) / 3600000);
				var minutes = Math.floor((iTimer % 3600000) / 60000);
				var seconds = Math.floor((iTimer % 60000) / 1000);
				var sTimer = "";
				var sDaysSign = this.getResourceBundle().getText("home_days");
				sTimer += days > 0 ? days + " " + sDaysSign + ", " : "";
				sTimer += hours > 9 ? "" + hours : "0" + hours;
				sTimer += ":";
				sTimer += minutes > 9 ? "" + minutes : "0" + minutes;
				sTimer += ":";
				sTimer += seconds > 9 ? "" + seconds : "0" + seconds;
				if (days > 0 && oViewModel.getProperty("/counter") !== days) {
					oViewModel.setProperty("/counter", days);
					this._oTimerIcon.addStyleClass("mjzsoftBlueCounter");
				} else if (days <= 0 && hours > 0 && oViewModel.getProperty("/counter") !== hours) {
					oViewModel.setProperty("/counter", hours);
					this._oTimerIcon.removeStyleClass("mjzsoftBlueCounter");
					this._oTimerIcon.addStyleClass("mjzsoftGreenCounter");
				} else if (days <= 0 && hours <= 0 && minutes > 0 && oViewModel.getProperty("/counter") !== minutes) {
					oViewModel.setProperty("/counter", minutes);
					this._oTimerIcon.removeStyleClass("mjzsoftBlueCounter");
					this._oTimerIcon.removeStyleClass("mjzsoftGreenCounter");
					this._oTimerIcon.addStyleClass("mjzsoftYellowCounter");
				} else if (days <= 0 && hours <= 0 && minutes <= 0 && seconds > 0 && oViewModel.getProperty("/counter") !== seconds) {
					oViewModel.setProperty("/counter", seconds);
					this._oTimerIcon.removeStyleClass("mjzsoftBlueCounter");
					this._oTimerIcon.removeStyleClass("mjzsoftGreenCounter");
					this._oTimerIcon.removeStyleClass("mjzsoftYellowCounter");
					oViewModel.setProperty("/sessionDialogText", this.getResourceBundle().getText("home_sessionMustRefresh", seconds));
					this._showJwtRefreshAlert();
				}
				oViewModel.setProperty("/sTimer", sTimer);
			}.bind(this), 1000);
		},
		
		_showJwtRefreshAlert: function () {
			if (!this._oSessionDialog) {
				var oSessionDialog = new Dialog({
					title: this.getResourceBundle().getText("home_warning"),
					type: DialogType.Message,
					state: sap.ui.core.ValueState.Warning,
					content: new Text({
						text: "{launchpadView>/sessionDialogText}"
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: this.getResourceBundle().getText("home_refresh"),
						press: function () {
							this.getOwnerComponent().getJwtAuth().refreshToken();
							oSessionDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						type: ButtonType.Negative,
						text: this.getResourceBundle().getText("home_signout"),
						press: function () {
							this.getOwnerComponent().getJwtAuth().signOut();
							oSessionDialog.close();
						}.bind(this)
					}),
					afterClose: function () {
						this._oSessionDialog = undefined;
						oSessionDialog.destroy();
					}.bind(this)
				});
				oSessionDialog.setModel(this.getModel("launchpadView"), "launchpadView");
				this._oSessionDialog = oSessionDialog;
			}
			if (!this._oSessionDialog.isOpen()) {
				this._oSessionDialog.open();
			}
		},
		
		_logout: function () {
			this.getOwnerComponent().getJwtAuth().signOut();
		},
		
		dialogPassUpdateSubmitBtnPress: function (oEvent) {
			var oViewModel = this.getModel("launchpadView"),
				sOldPassword = oViewModel.getProperty("/oldPass"),
				sNewPassword = oViewModel.getProperty("/newPass"),
				oInput = sap.ui.core.Fragment.byId("passUpdateDialog", "confirmNewPassInput");
			if (!this.areFieldsValid("UpdatePass", this._oPassUpdateDialog)) {
				return;
			}
			if(!oViewModel.getProperty("/passConfirmed")){
				oInput.setValueState(sap.ui.core.ValueState.Error);
				return;
			}
			oInput.setValueState(sap.ui.core.ValueState.None);
			this._oPassUpdateDialog.setBusy(true);
			this.getOwnerComponent().getJwtAuth().updatePassword(sOldPassword, sNewPassword, function (data, textStatus, jqXHR) {
				this._oPassUpdateDialog.setBusy(false);
				this._oPassUpdateDialog.close();
				this._logout();
			}.bind(this), function (err, textStatus, jqXHR) {
				this._oPassUpdateDialog.setBusy(false);
				var sMsg = this.extractErrorMessage(err, textStatus, jqXHR);
				oViewModel.setProperty("/error", sMsg);
			}.bind(this));
		},
		
		dialogCloseBtnPress: function (oEvent) {
			if (this._oInfoDialog) {
				this._oInfoDialog.close();
			}
			if (this._oPassUpdateDialog) {
				this._oPassUpdateDialog.close();
			}
		},
		
		onConfirmPassChanged: function (oEvent) {
			var oViewModel = this.getModel("launchpadView"),
				sNewPassword = oViewModel.getProperty("/newPass"),
				sConfirmNewPassword = oViewModel.getProperty("/confirmNewPass");
			if(sNewPassword !== sConfirmNewPassword){
				oViewModel.setProperty("/passConfirmed", false);
			} else {	
				oViewModel.setProperty("/passConfirmed", true);
			}
		},
		
		onErrorStripClosed: function (oEvent) {
			this.getViewModel().setProperty("/error", null);
		}
	});
});