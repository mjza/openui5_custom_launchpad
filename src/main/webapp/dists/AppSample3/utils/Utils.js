sap.ui.define(["sap/m/Dialog","sap/m/Text","sap/m/Button","sap/ui/core/ValueState"],function(e,t,n,r){"use strict";return{showDialog:function(s,u,o,a,i,c,p,l){var f=new e({title:u,type:sap.m.DialogType.Message,state:i?r.Warning:r.Success,content:new t({text:o}),buttons:[new n({text:i?s.getResourceBundle().getText("BtnYes"):l,width:i?"45%":"30%",press:function(){f.close();if(a===undefined){return}else{a()}},type:i?sap.m.ButtonType.Accept:sap.m.ButtonType.Default}),new n({text:i?s.getResourceBundle().getText("BtnNo"):p,width:i?"45%":"30%",press:function(){f.close();if(c===undefined){return}else{c()}},type:i?sap.m.ButtonType.Reject:sap.m.ButtonType.Default})],afterClose:function(){f.destroy()}});f.open();return f},showNormalDialog:function(r,s,u,o,a,i,c){var p=new e({title:s,type:sap.m.DialogType.Message,state:u,content:new t({text:o}),buttons:[new n({text:i,width:c===""?"90%":"40%",press:function(){p.close()},type:sap.m.ButtonType.Transparent}),new n({text:c,visible:c===""?false:true,width:"40%",press:function(){p.close();if(a===undefined){return}else{a()}}})],afterClose:function(){p.destroy()}});p.open();return p},readData:function(e,t,n){var r=jQuery.Deferred();e.read(t,{urlParameters:n,success:r.resolve,error:r.reject});return r},submitChanges:function(e,t){var n=jQuery.Deferred();e.submitChanges(jQuery.extend({},t,{success:n.resolve,error:n.reject}));return n},update:function(e,t,n){var r=jQuery.Deferred();e.update(t,n,{success:r.resolve,error:r.reject});return r}}});