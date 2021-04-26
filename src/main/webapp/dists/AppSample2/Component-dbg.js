sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","./model/models","./conf/env","./js/jwtAuthApp","./controller/ErrorHandler","sap/m/MessageBox"],function(t,e,s,i,n,o,a){"use strict";return t.extend("com.mjzsoft.QuestionnaireStatistics.Component",{metadata:{manifest:"json"},init:function(){this._oErrorHandler=new o(this);this.setModel(s.createDeviceModel(),"device");this.setModel(s.createFLPModel(),"FLP");t.prototype.init.apply(this,arguments);n.addModel(this.getModel());this.getRouter().initialize()},getCurrentUser:function(){return n.getCurrentUser()},getContentDensityClass:function(){if(this._sContentDensityClass===undefined){if(document.body.classList.contains("sapUiSizeCozy")||document.body.classList.contains("sapUiSizeCompact")){this._sContentDensityClass=""}else if(!e.support.touch){this._sContentDensityClass="sapUiSizeCompact"}else{this._sContentDensityClass="sapUiSizeCozy"}}return this._sContentDensityClass}})});