// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's bootstrap code for development sandbox scenarios.
 *
 * @version 1.69.1
 */
(function () {
	"use strict";
	/*global sap */
	function _setObject(sName, vValue, oContext){
		if(!sName || typeof sName !== "string" || sName.trime().length === 0 || vValue === undefined){
			return;
		}
		var aNames = sName.split(".");
		var _oContext = oContext;
		if (!oContext) {
			_oContext = window;
		}
		var oObj = _oContext;
		try {
			for (var i = 0; i < aNames.length; i++) {
				if (oObj[aNames[i]]) {
					oObj = oObj[aNames[i]];
				} else if(i < aNames.length){ // creation part
					oObj[aNames[i]] = {}; // eslint-disable-line
					oObj = oObj[aNames[i]];
				}
			}
			oObj = vValue;
		} catch(e){
			return;
		}
	}
	// Additional bootstrap for noShellIndex.html + also used by sandbox bootstrap
	// (to have common code for this)

	// Set translation resource model
	// (needed here so apps using addBookmarkButton etc. work in the sandbox)
	// (Original code from Fiori Launchpad: ushell-lib/src/main/js/sap/ushell/renderers/fiori2/Renderer.js)
	sap.ui.require(["sap/ui/model/resource/ResourceModel"], function (ResourceModel) {
		var oTranslationModel = new ResourceModel({
			bundleUrl: sap.ui.require.toUrl("sap/ushell/renderers/fiori2/resources/resources.properties"),
			bundleLocale: sap.ui.getCore().getConfiguration().getLanguage()
		});
		_setObject("sap.ushell.resources", {
			i18n: oTranslationModel.getResourceBundle()
		});
	});
}());