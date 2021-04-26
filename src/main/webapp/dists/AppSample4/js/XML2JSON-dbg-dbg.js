/*global ActiveXObject*/
sap.ui.define([], function () {
	"use strict";

	return {
		/** 
		 * creates xml to json parser
		 * @constructor 
		 * @param {object} oOption predefined parameters for configuration of output
		 */
		X2JS: function (oOption) {
			/*
			 Copyright 2011-2013 Abdulla Abdurakhmanov
			 Original sources are available at https://code.google.com/p/x2js/
			
			 Licensed under the Apache License, Version 2.0 (the "License");
			 you may not use this file except in compliance with the License.
			 You may obtain a copy of the License at
			
			 http://www.apache.org/licenses/LICENSE-2.0
			
			 Unless required by applicable law or agreed to in writing, software
			 distributed under the License is distributed on an "AS IS" BASIS,
			 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
			 See the License for the specific language governing permissions and
			 limitations under the License.
			 */
			const VERSION = "1.2.0",
				DOMNodeTypes = {
					ELEMENT_NODE: 1,
					TEXT_NODE: 3,
					CDATA_SECTION_NODE: 4,
					COMMENT_NODE: 8,
					DOCUMENT_NODE: 9
				};

			var oConfig = oOption || {};

			/** 
			 * sets initial values based on oOption
			 */
			(function initConfigDefaults() {
				if (oConfig.escapeMode === undefined) {
					oConfig.escapeMode = true;
				}
				oConfig.attributePrefix = oConfig.attributePrefix || "_";
				oConfig.arrayAccessForm = oConfig.arrayAccessForm || "none";
				oConfig.emptyNodeForm = oConfig.emptyNodeForm || "text";
				if (oConfig.enableToStringFunc === undefined) {
					oConfig.enableToStringFunc = true;
				}
				oConfig.arrayAccessFormPaths = oConfig.arrayAccessFormPaths || [];
				if (oConfig.skipEmptyTextNodesForObj === undefined) {
					oConfig.skipEmptyTextNodesForObj = true;
				}
				if (oConfig.stripWhitespaces === undefined) {
					oConfig.stripWhitespaces = true;
				}
				oConfig.datetimeAccessFormPaths = oConfig.datetimeAccessFormPaths || [];
				if (oConfig.useDoubleQuotes === undefined) {
					oConfig.useDoubleQuotes = false;
				}
				oConfig.xmlElementsFilter = oConfig.xmlElementsFilter || [];
				oConfig.jsonPropertiesFilter = oConfig.jsonPropertiesFilter || [];
				if (oConfig.keepCData === undefined) {
					oConfig.keepCData = false;
				}
			})();

			/** 
			 * gets the name of node
			 * @param {object} oNode as part of DOM
			 * @returns {string} name of node
			 */
			function getNodeLocalName(oNode) {
				var sNodeLocalName = oNode.localName;
				if (sNodeLocalName === null) { // Yeah, this is IE!! 
					sNodeLocalName = oNode.baseName;
				}
				if (sNodeLocalName === null || sNodeLocalName === "") { // =="" is IE too
					sNodeLocalName = oNode.nodeName;
				}
				return sNodeLocalName;
			}

			/** 
			 * gets the prefix of node
			 * @param {object} oNode node as part of DOM
			 * @returns {string} prefix of node
			 */
			function getNodePrefix(oNode) {
				return oNode.prefix;
			}

			/** 
			 * converts html tags to xml
			 * @param {string} sString text to escape
			 * @returns {string} escaped string
			 */
			function escapeXmlChars(sString) {
				if (typeof (sString) === "string") {
					return sString.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
				} else {
					return sString;
				}
			}

			/** 
			 * converts xml tags to html
			 * @param {string} sString text to unescape
			 * @returns {string} unescaped string
			 */
			function unescapeXmlChars(sString) { // eslint-disable-line no-unused-vars
				return sString.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
			}

			/** 
			 * checks if object is one of special object
			 * @param {array} aStdFiltersArrayForm form
			 * @param {object} oObject current from xml parsed object
			 * @param {string} sName name of property
			 * @param {string} sPath path to property
			 * @returns {boolean} true - object is of type of aStdFiltersArrayForm
			 */
			function checkInStdFiltersArrayForm(aStdFiltersArrayForm, oObject, sName, sPath) {
				for (var i = 0; i < aStdFiltersArrayForm.length; i++) {
					var filterPath = aStdFiltersArrayForm[i];
					if (typeof filterPath === "string") {
						if (filterPath === sPath) {
							break;
						}
					} else if (filterPath instanceof RegExp) {
						if (filterPath.test(sPath)) {
							break;
						}
					} else if (typeof filterPath === "function") {
						if (filterPath(oObject, sName, sPath)) {
							break;
						}
					}
				}
				return i !== aStdFiltersArrayForm.length;
			}

			/** 
			 * adds sChildName as array property
			 * @param {object} oObject current json object
			 * @param {string} sChildName name of child
			 * @param {string} sPath path to property
			 */
			function toArrayAccessForm(oObject, sChildName, sPath) {
				if (oConfig.arrayAccessForm === "property") {
					if (!(oObject[sChildName] instanceof Array)) {
						oObject[sChildName + "_asArray"] = [oObject[sChildName]];
					} else {
						oObject[sChildName + "_asArray"] = oObject[sChildName];
					}
				}
				if (!(oObject[sChildName] instanceof Array) && oConfig.arrayAccessFormPaths.length > 0) {
					if (checkInStdFiltersArrayForm(oConfig.arrayAccessFormPaths, oObject, sChildName, sPath)) {
						oObject[sChildName] = [oObject[sChildName]];
					}
				}
			}

			/** 
			 * converts time to Date
			 * @param {string} sDateTime time as string
			 * @returns {Date} dat of sDateTime
			 */
			function fromXmlDateTime(sDateTime) {
				// Implementation based up on http://stackoverflow.com/questions/8178598/xml-datetime-to-javascript-date-object
				// Improved to support full spec and optional parts
				var aBits = sDateTime.split(/[-T:+Z]/g),
					oDate = new Date(aBits[0], aBits[1] - 1, aBits[2]),
					aSecondaBits = aBits[5].split("\.");
				oDate.setHours(aBits[3], aBits[4], aSecondaBits[0]);
				if (aSecondaBits.length > 1) {
					oDate.setMilliseconds(aSecondaBits[1]);
				}
				// Get supplied time zone offset in minutes
				if (aBits[6] && aBits[7]) {
					var iOffsetMinutes = aBits[6] * 60 + Number(aBits[7]);
					var sSign = /\d\d-\d\d:\d\d$/.test(sDateTime) ? "-" : "+";
					// Apply the sSign
					iOffsetMinutes = 0 + (sSign === "-" ? -1 * iOffsetMinutes : iOffsetMinutes);
					// Apply offset and local timezone
					oDate.setMinutes(oDate.getMinutes() - iOffsetMinutes - oDate.getTimezoneOffset());
				} else
				if (sDateTime.indexOf("Z", sDateTime.length - 1) !== -1) {
					oDate = new Date(Date.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate(), oDate.getHours(), oDate.getMinutes(), oDate.getSeconds(),
						oDate.getMilliseconds()));
				}
				// oDate is now a local time equivalent to the supplied time
				return oDate;
			}

			/** 
			 * checks if string is of type Date and coverts it to Date or gives string back
			 * @param {string} sValue string to check
			 * @param {string} sChildName name of child
			 * @param {string} sFullPath path to propertyy
			 * @returns {object/Date} object
			 */
			function checkFromXmlDateTimePaths(sValue, sChildName, sFullPath) {
				if (oConfig.datetimeAccessFormPaths.length > 0) {
					var sPath = sFullPath.split("\.#")[0];
					if (checkInStdFiltersArrayForm(oConfig.datetimeAccessFormPaths, sValue, sChildName, sPath)) {
						return fromXmlDateTime(sValue);
					} else {
						return sValue;
					}
				} else {
					return sValue;
				}
			}

			/** 
			 * checks if object contains some filters
			 * @param {object} oObject current from xml parsed object
			 * @param {integer} sChildType type of child
			 * @param {string} sChildName name of child
			 * @param {string} sChildPath path to child
			 * @returns {boolean} true - object contains filter(s)
			 */
			function checkXmlElementsFilter(oObject, sChildType, sChildName, sChildPath) {
				if (sChildType === DOMNodeTypes.ELEMENT_NODE && oConfig.xmlElementsFilter.length > 0) {
					return checkInStdFiltersArrayForm(oConfig.xmlElementsFilter, oObject, sChildName, sChildPath);
				} else {
					return true;
				}
			}

			/** 
			 * converts xml to json object
			 * @param {object} oNode xml object
			 * @param {string} sPath route to current child
			 * @returns {object} json of xml
			 */
			/* eslint-disable complexity */
			function parseDOMChildren(oNode, sPath) { // eslint-disable-line max-statements
				var oResult = {},
					aNodeChildren, oChild, sChildName;
				if (oNode.nodeType === DOMNodeTypes.DOCUMENT_NODE) {
					aNodeChildren = oNode.childNodes;
					// Alternative for firstElementChild which is not supported in some environments
					for (var i = 0; i < aNodeChildren.length; i++) {
						oChild = aNodeChildren.item(i);
						if (oChild.nodeType === DOMNodeTypes.ELEMENT_NODE) {
							sChildName = getNodeLocalName(oChild);
							oResult[sChildName] = parseDOMChildren(oChild, sChildName);
						}
					}
					return oResult;
				} else if (oNode.nodeType === DOMNodeTypes.ELEMENT_NODE) {
					oResult.__cnt = 0;
					aNodeChildren = oNode.childNodes;
					// Children nodes
					for (i = 0; i < aNodeChildren.length; i++) {
						oChild = aNodeChildren.item(i); // aNodeChildren[i];
						sChildName = getNodeLocalName(oChild);
						if (oChild.nodeType === DOMNodeTypes.COMMENT_NODE) {
							continue;
						}
						var sChildPath = sPath + "." + sChildName;
						if (checkXmlElementsFilter(oResult, oChild.nodeType, sChildName, sChildPath)) {
							oResult.__cnt++;
							if (oResult[sChildName] === null) {
								oResult[sChildName] = parseDOMChildren(oChild, sChildPath);
								toArrayAccessForm(oResult, sChildName, sChildPath);
							} else {
								if (oResult[sChildName] !== null && !(oResult[sChildName] instanceof Array)) { // eslint-disable-line
									oResult[sChildName] = [oResult[sChildName]];
									toArrayAccessForm(oResult, sChildName, sChildPath);
								}
								(oResult[sChildName])[oResult[sChildName].length] = parseDOMChildren(oChild, sChildPath);
							}
						}
					}
					// Attributes
					for (i = 0; i < oNode.attributes.length; i++) {
						var attr = oNode.attributes.item(i); // [i];
						oResult.__cnt++;
						oResult[oConfig.attributePrefix + attr.name] = attr.value;
					}
					// Node namespace prefix
					var sNodePrefix = getNodePrefix(oNode);
					if (sNodePrefix !== null && sNodePrefix !== "") {
						oResult.__cnt++;
						oResult.__prefix = sNodePrefix;
					}
					if (oResult["#text"] !== null) {
						oResult.__text = oResult["#text"];
						if (oResult.__text instanceof Array) {
							oResult.__text = oResult.__text.join("\n");
						}
						//if(oConfig.escapeMode)
						//	oResult.__text = unescapeXmlChars(oResult.__text);
						if (oConfig.stripWhitespaces) {
							oResult.__text = oResult.__text.trim();
						}
						delete oResult["#text"];
						if (oConfig.arrayAccessForm === "property") {
							delete oResult["#text_asArray"];
						}
						oResult.__text = checkFromXmlDateTimePaths(oResult.__text, sChildName, sPath + "." + sChildName);
					}
					if (oResult["#cdata-section"] !== null) {
						oResult.__cdata = oResult["#cdata-section"];
						delete oResult["#cdata-section"];
						if (oConfig.arrayAccessForm === "property") {
							delete oResult["#cdata-section_asArray"];
						}
					}
					if (oResult.__cnt === 0 && oConfig.emptyNodeForm === "text") {
						oResult = "";
					} else if (oResult.__cnt === 1 && oResult.__text !== null) {
						oResult = oResult.__text;
					} else if (oResult.__cnt === 1 && oResult.__cdata !== null && !oConfig.keepCData) {
						oResult = oResult.__cdata;
					} else if (oResult.__cnt > 1 && oResult.__text !== null && oConfig.skipEmptyTextNodesForObj) {
						if ((oConfig.stripWhitespaces && oResult.__text === "") || (oResult.__text.trim() === "")) {
							delete oResult.__text;
						}
					}
					delete oResult.__cnt;
					if (oConfig.enableToStringFunc && (oResult.__text !== null || oResult.__cdata !== null)) {
						oResult.toString = function () {
							return (this.__text !== null ? this.__text : "") + (this.__cdata !== null ? this.__cdata : "");
						};
					}
					return oResult;
				} else if (oNode.nodeType === DOMNodeTypes.TEXT_NODE || oNode.nodeType === DOMNodeTypes.CDATA_SECTION_NODE) {
					return oNode.nodeValue;
				}
				return oResult;
			}

			/** 
			 * creates a start xml tag of given json
			 * @param {object} oJSON object to make xml for
			 * @param {string} sElement key name of oJSON
			 * @param {array} aAttrList list of attributes
			 * @param {boolean} bClosed true = no inner objects
			 * @returns {string} xml tag
			 */
			function startTag(oJSON, sElement, aAttrList, bClosed) {
				var sResult = "<" + ((oJSON !== null && oJSON.__prefix !== null) ? (oJSON.__prefix + ":") : "") + sElement;
				if (aAttrList !== null) {
					for (var i = 0; i < aAttrList.length; i++) {
						var attrName = aAttrList[i];
						var attrVal = oJSON[attrName];
						if (oConfig.escapeMode) {
							attrVal = escapeXmlChars(attrVal);
						}
						sResult += " " + attrName.substr(oConfig.attributePrefix.length) + "=";
						if (oConfig.useDoubleQuotes) {
							sResult += '"' + attrVal + '"';
						} else {
							sResult += "'" + attrVal + "'";
						}
					}
				}
				if (bClosed) {
					sResult += "/>";
				} else {
					sResult += ">";
				}
				return sResult;
			}

			/** 
			 * creates an end xml tag of given json
			 * @param {object} oJSON object to make xml for
			 * @param {string} sElementName key name of oJSON
			 * @returns {string} end tag for xml
			 */
			function endTag(oJSON, sElementName) {
				return "</" + (oJSON.__prefix !== null ? (oJSON.__prefix + ":") : "") + sElementName + ">";
			}

			/** 
			 * checks if string ends with some suffix
			 * @param {string} sString text to check
			 * @param {string} sSuffix end of text to check
			 * @returns {boolean} true - sString contains suffix
			 */
			function endsWith(sString, sSuffix) {
				return sString.indexOf(sSuffix, sString.length - sSuffix.length) !== -1;
			}

			/** 
			 * checks if given object is special
			 * @param {object} oJSON object to make xml for
			 * @param {string} sJSONObjField key name of oJSON
			 * @returns {boolean} true - is speical element
			 */
			function jsonXmlSpecialElem(oJSON, sJSONObjField) {
				if ((oConfig.arrayAccessForm === "property" && endsWith(sJSONObjField.toString(), ("_asArray"))) || sJSONObjField.toString().indexOf(
						oConfig.attributePrefix) === 0 || sJSONObjField.toString().indexOf("__") === 0 || (oJSON[sJSONObjField] instanceof Function)) {
					return true;
				} else {
					return false;
				}
			}

			/** 
			 * calculates count of xml elements in given json
			 * @param {object} oJSON object to make xml for
			 * @returns {integer} count of xml elements
			 */
			function jsonXmlElemCount(oJSON) {
				var iElementsCnt = 0;
				if (oJSON instanceof Object) {
					for (var it in oJSON) {
						if (jsonXmlSpecialElem(oJSON, it)) {
							continue;
						}
						iElementsCnt++;
					}
				}
				return iElementsCnt;
			}

			/** 
			 * checks if object contains some filters
			 * @param {object} oJSON object to make xml for
			 * @param {string} sPropertyName key name of oJSON
			 * @param {string} sJSONObjPath path of object
			 * @returns {boolean} true - object contains filter(s)
			 */
			function checkJsonObjPropertiesFilter(oJSON, sPropertyName, sJSONObjPath) {
				return oConfig.jsonPropertiesFilter.length === 0 || sJSONObjPath === "" || checkInStdFiltersArrayForm(oConfig.jsonPropertiesFilter,
					oJSON, sPropertyName, sJSONObjPath);
			}

			/** 
			 * converts object attributes to array
			 * @param {object} oJSON object to extract attributes
			 * @returns {array} list of attributes
			 */
			function parseJSONAttributes(oJSON) {
				var aAttrList = [];
				if (oJSON instanceof Object) {
					for (var ait in oJSON) {
						if (ait.toString().indexOf("__") === -1 && ait.toString().indexOf(oConfig.attributePrefix) === 0) {
							aAttrList.push(ait);
						}
					}
				}
				return aAttrList;
			}

			/** 
			 * parses text attribute to xml representation
			 * @param {object} oJSON object to parse
			 * @returns {string} xml of test arributes
			 */
			function parseJSONTextAttrs(oJSON) {
				var sResult = "";
				if (oJSON.__cdata !== null) {
					sResult += "<![CDATA[" + oJSON.__cdata + "]]>";
				}
				if (oJSON.__text !== null) {
					if (oConfig.escapeMode) {
						sResult += escapeXmlChars(oJSON.__text);
					} else {
						sResult += oJSON.__text;
					}
				}
				return sResult;
			}

			/** 
			 * parses json to xml representation
			 * @param {vary} vJSONTxtObj json object or string to parse
			 * @returns {string} xml of given object
			 */
			function parseJSONTextObject(vJSONTxtObj) {
				var sResult = "";
				if (vJSONTxtObj instanceof Object) {
					sResult += parseJSONTextAttrs(vJSONTxtObj);
				} else if (vJSONTxtObj !== null) {
					if (oConfig.escapeMode) {
						sResult += escapeXmlChars(vJSONTxtObj);
					} else {
						sResult += vJSONTxtObj;
					}
				}
				return sResult;
			}

			/** 
			 * returns the path for json property
			 * @param {string} sJSONObjPath path to object
			 * @param {string} sJSONPropName key name of oJSON
			 * @returns {string} path to property
			 */
			function getJsonPropertyPath(sJSONObjPath, sJSONPropName) {
				if (sJSONObjPath === "") {
					return sJSONPropName;
				} else {
					return sJSONObjPath + "." + sJSONPropName;
				}
			}

			/** 
			 * converts json to xml
			 * @param {object} oJSON object to make xml for
			 * @param {string} sJSONObjPath path to object
			 * @returns {string} xml of oJSON
			 */
			function parseJSONObject(oJSON, sJSONObjPath) {
				var sResult = "";
				var iElementsCnt = jsonXmlElemCount(oJSON);
				if (iElementsCnt > 0) {
					for (var it in oJSON) {
						if (jsonXmlSpecialElem(oJSON, it) || (sJSONObjPath !== "" &&
								!checkJsonObjPropertiesFilter(oJSON, it, getJsonPropertyPath(sJSONObjPath, it)))) {
							continue;
						}
						var subObj = oJSON[it];
						var aAttrList = parseJSONAttributes(subObj);
						if (subObj === null || subObj === undefined) {
							sResult += startTag(subObj, it, aAttrList, true);
						} else
						if (subObj instanceof Object) {
							if (subObj instanceof Array) {
								sResult += parseJSONArray(subObj, it, aAttrList, sJSONObjPath); // eslint-disable-line
							} else if (subObj instanceof Date) {
								sResult += startTag(subObj, it, aAttrList, false);
								sResult += subObj.toISOString();
								sResult += endTag(subObj, it);
							} else if (jsonXmlElemCount(subObj) > 0 || subObj.__text !== null || subObj.__cdata !== null) {
								sResult += startTag(subObj, it, aAttrList, false);
								sResult += parseJSONObject(subObj, getJsonPropertyPath(sJSONObjPath, it));
								sResult += endTag(subObj, it);
							} else {
								sResult += startTag(subObj, it, aAttrList, true);
							}
						} else {
							sResult += startTag(subObj, it, aAttrList, false);
							sResult += parseJSONTextObject(subObj);
							sResult += endTag(subObj, it);
						}
					}
				}
				sResult += parseJSONTextObject(oJSON);
				return sResult;
			}

			/** 
			 * converts json attribute to xml
			 * @param {object/array} aJSONArrRoot object to make xml for
			 * @param {string} sJSONObjName key name of oJSON
			 * @param {array} aAttrList list of attributes
			 * @param {string} sJSONObjPath path to object
			 * @returns {string} xml representation of json attribute
			 */
			function parseJSONArray(aJSONArrRoot, sJSONObjName, aAttrList, sJSONObjPath) {
				var sResult = "";
				if (aJSONArrRoot.length === 0) {
					sResult += startTag(aJSONArrRoot, sJSONObjName, aAttrList, true);
				} else {
					for (var arIdx = 0; arIdx < aJSONArrRoot.length; arIdx++) {
						sResult += startTag(aJSONArrRoot[arIdx], sJSONObjName, parseJSONAttributes(aJSONArrRoot[arIdx]), false);
						sResult += parseJSONObject(aJSONArrRoot[arIdx], getJsonPropertyPath(sJSONObjPath, sJSONObjName));
						sResult += endTag(aJSONArrRoot[arIdx], sJSONObjName);
					}
				}
				return sResult;
			}

			/** 
			 * converts xml to json
			 * @param {string} sXMLDoc xml as string
			 * @returns {object} json representation of xml
			 */
			this.parseXmlString = function (sXMLDoc) {
				var isIEParser = window.ActiveXObject || "ActiveXObject" in window;
				if (sXMLDoc === undefined) {
					return null;
				}
				var oXMLDoc;
				if (window.DOMParser) {
					var parser = new window.DOMParser();
					var parsererrorNS = null;
					// IE9+ now is here
					if (!isIEParser) {
						try {
							parsererrorNS = parser.parseFromString("INVALID", "text/xml").getElementsByTagName("parsererror")[0].namespaceURI;
						} catch (err) {
							parsererrorNS = null;
						}
					}
					try {
						oXMLDoc = parser.parseFromString(sXMLDoc, "text/xml");
						if (parsererrorNS !== null && oXMLDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
							//throw new Error('Error parsing XML: '+sXMLDoc);
							oXMLDoc = null;
						}
					} catch (err) {
						oXMLDoc = null;
					}
				} else {
					// IE :(
					var _sXMLDoc = sXMLDoc;
					if (sXMLDoc.indexOf("<?") === 0) {
						_sXMLDoc = sXMLDoc.substr(sXMLDoc.indexOf("?>") + 2);
					}
					oXMLDoc = new ActiveXObject("Microsoft.XMLDOM");
					oXMLDoc.async = "false";
					oXMLDoc.loadXML(_sXMLDoc);
				}
				return oXMLDoc;
			};

			/** 
			 * converts property to array
			 * @param {object} oProperty property to convert
			 * @returns {array} property as array
			 */
			this.asArray = function (oProperty) {
				if (oProperty === undefined || oProperty === null) {
					return [];
				} else {
					if (oProperty instanceof Array) {
						return oProperty;
					} else {
						return [oProperty];
					}
				}
			};

			/** 
			 * converts property to Date
			 * @param {object} oDate property to convert
			 * @returns {Date} property as date
			 */
			this.toXmlDateTime = function (oDate) {
				if (oDate instanceof Date) {
					return oDate.toISOString();
				} else {
					if (typeof (oDate) === "number") {
						return new Date(oDate).toISOString();
					} else {
						return null;
					}
				}
			};

			/** 
			 * converts property to Date with time
			 * @param {object} oProperty property to convert
			 * @returns {Date} property as Date
			 */
			this.asDateTime = function (oProperty) {
				if (typeof (oProperty) === "string") {
					return fromXmlDateTime(oProperty);
				} else {
					return oProperty;
				}
			};

			/** 
			 * converts xml children to json
			 * @param {object} oXMLDoc property to convert
			 * @returns {object} parsed xml with children
			 */
			this.XML2JSON = function (oXMLDoc) {
				return parseDOMChildren(oXMLDoc);
			};

			/** 
			 * converts xml to json
			 * @param {string} sXMLDoc xml in string form
			 * @returns {object} parsed xml with children
			 */
			this.XMLStr2JSON = function (sXMLDoc) {
				var oXMLDoc = this.parseXmlString(sXMLDoc);
				if (oXMLDoc !== null) {
					return this.XML2JSON(oXMLDoc);
				} else {
					return null;
				}
			};

			/** 
			 * converts json to xml
			 * @param {object} oJSON json to convert
			 * @returns {string} json representation as xml
			 */
			this.JSON2XMLStr = function (oJSON) {
				return parseJSONObject(oJSON, "");
			};

			/** 
			 * converts json to xml
			 * @param {object} oJSON json to convert
			 * @returns {string} json representation as xml
			 */
			this.JSON2XML = function (oJSON) {
				var sXMLDoc = this.JSON2XMLStr(oJSON);
				return this.parseXmlString(sXMLDoc);
			};

			/** 
			 * returns version of parser
			 * @returns {string} version of parser
			 */
			this.getVersion = function () {
				return VERSION;
			};
		}
	};
});