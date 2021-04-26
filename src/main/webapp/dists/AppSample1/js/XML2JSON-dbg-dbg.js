/*global ActiveXObject*/
sap.ui.define([], function () {
	"use strict";

	return {
		/** 
		 * creates xml to json parser
		 * @constructor 
		 * @param {object} config predefined parameters for configuration of output
		 */
		X2JS: function (config) {
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
			var VERSION = "1.2.0";

			config = config || {};
			initConfigDefaults();
			initRequiredPolyfills();

			/** 
			 * sets initial values based on config
			 */
			function initConfigDefaults() {
				if (config.escapeMode === undefined) {
					config.escapeMode = true;
				}

				config.attributePrefix = config.attributePrefix || "_";
				config.arrayAccessForm = config.arrayAccessForm || "none";
				config.emptyNodeForm = config.emptyNodeForm || "text";

				if (config.enableToStringFunc === undefined) {
					config.enableToStringFunc = true;
				}
				config.arrayAccessFormPaths = config.arrayAccessFormPaths || [];
				if (config.skipEmptyTextNodesForObj === undefined) {
					config.skipEmptyTextNodesForObj = true;
				}
				if (config.stripWhitespaces === undefined) {
					config.stripWhitespaces = true;
				}
				config.datetimeAccessFormPaths = config.datetimeAccessFormPaths || [];

				if (config.useDoubleQuotes === undefined) {
					config.useDoubleQuotes = false;
				}

				config.xmlElementsFilter = config.xmlElementsFilter || [];
				config.jsonPropertiesFilter = config.jsonPropertiesFilter || [];

				if (config.keepCData === undefined) {
					config.keepCData = false;
				}
			}

			var DOMNodeTypes = {
				ELEMENT_NODE: 1,
				TEXT_NODE: 3,
				CDATA_SECTION_NODE: 4,
				COMMENT_NODE: 8,
				DOCUMENT_NODE: 9
			};

			function initRequiredPolyfills() {}

			/** 
			 * gets the name of node
			 * @param {object} node as part of DOM
			 * @returns {string} name of node
			 */
			function getNodeLocalName(node) {
				var nodeLocalName = node.localName;
				if (nodeLocalName == null) { // Yeah, this is IE!! 
					nodeLocalName = node.baseName;
				}
				if (nodeLocalName == null || nodeLocalName == "") { // =="" is IE too
					nodeLocalName = node.nodeName;
				}
				return nodeLocalName;
			}

			/** 
			 * gets the prefix of node
			 * @param {object} node node as part of DOM
			 * @returns {string} prefix of node
			 */
			function getNodePrefix(node) {
				return node.prefix;
			}

			/** 
			 * converts html tags to xml
			 * @param {string} str text to escape
			 * @returns {string} escaped string
			 */
			function escapeXmlChars(str) {
				if (typeof (str) == "string") {
					return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
				} else {
					return str;
				}
			}

			/** 
			 * converts xml tags to html
			 * @param {string} str text to unescape
			 * @returns {string} unescaped string
			 */
			function unescapeXmlChars(str) {
				return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
			}

			/** 
			 * checks if object is one of special object
			 * @param {array} stdFiltersArrayForm form
			 * @param {object} obj current from xml parsed object
			 * @param {string} name name of property
			 * @param {string} path path to property
			 * @returns {boolean} true - object is of type of stdFiltersArrayForm
			 */
			function checkInStdFiltersArrayForm(stdFiltersArrayForm, obj, name, path) {
				var idx = 0;
				for (; idx < stdFiltersArrayForm.length; idx++) {
					var filterPath = stdFiltersArrayForm[idx];
					if (typeof filterPath === "string") {
						if (filterPath == path) {
							break;
						}
					} else
					if (filterPath instanceof RegExp) {
						if (filterPath.test(path)) {
							break;
						}
					} else
					if (typeof filterPath === "function") {
						if (filterPath(obj, name, path)) {
							break;
						}
					}
				}
				return idx != stdFiltersArrayForm.length;
			}

			/** 
			 * adds childName as array property
			 * @param {object} obj current json object
			 * @param {string} childName name of child
			 * @param {string} path path to property
			 */
			function toArrayAccessForm(obj, childName, path) {
				switch (config.arrayAccessForm) {
				case "property":
					if (!(obj[childName] instanceof Array)) {
						obj[childName + "_asArray"] = [obj[childName]];
					} else {
						obj[childName + "_asArray"] = obj[childName];
					}
					break;
					/*case "none":
						break;*/
				}

				if (!(obj[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0) {
					if (checkInStdFiltersArrayForm(config.arrayAccessFormPaths, obj, childName, path)) {
						obj[childName] = [obj[childName]];
					}
				}
			}

			/** 
			 * converts time to Date
			 * @param {string} prop time as string
			 * @returns {Date} dat of prop
			 */
			function fromXmlDateTime(prop) {
				// Implementation based up on http://stackoverflow.com/questions/8178598/xml-datetime-to-javascript-date-object
				// Improved to support full spec and optional parts
				var bits = prop.split(/[-T:+Z]/g);

				var d = new Date(bits[0], bits[1] - 1, bits[2]);
				var secondBits = bits[5].split("\.");
				d.setHours(bits[3], bits[4], secondBits[0]);
				if (secondBits.length > 1) {
					d.setMilliseconds(secondBits[1]);
				}

				// Get supplied time zone offset in minutes
				if (bits[6] && bits[7]) {
					var offsetMinutes = bits[6] * 60 + Number(bits[7]);
					var sign = /\d\d-\d\d:\d\d$/.test(prop) ? "-" : "+";

					// Apply the sign
					offsetMinutes = 0 + (sign == "-" ? -1 * offsetMinutes : offsetMinutes);

					// Apply offset and local timezone
					d.setMinutes(d.getMinutes() - offsetMinutes - d.getTimezoneOffset());
				} else
				if (prop.indexOf("Z", prop.length - 1) !== -1) {
					d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));
				}

				// d is now a local time equivalent to the supplied time
				return d;
			}

			/** 
			 * checks if string is of type Date and coverts it to Date or gives string back
			 * @param {string} value string to check
			 * @param {string} childName name of child
			 * @param {string} fullPath path to propertyy
			 * @returns {object/Date} object
			 */
			function checkFromXmlDateTimePaths(value, childName, fullPath) {
				if (config.datetimeAccessFormPaths.length > 0) {
					var path = fullPath.split("\.#")[0];
					if (checkInStdFiltersArrayForm(config.datetimeAccessFormPaths, value, childName, path)) {
						return fromXmlDateTime(value);
					} else {
						return value;
					}
				} else {
					return value;
				}
			}

			/** 
			 * checks if object contains some filters
			 * @param {object} obj current from xml parsed object
			 * @param {integer} childType type of child
			 * @param {string} childName name of child
			 * @param {string} childPath path to child
			 * @returns {boolean} true - object contains filter(s)
			 */
			function checkXmlElementsFilter(obj, childType, childName, childPath) {
				if (childType == DOMNodeTypes.ELEMENT_NODE && config.xmlElementsFilter.length > 0) {
					return checkInStdFiltersArrayForm(config.xmlElementsFilter, obj, childName, childPath);
				} else {
					return true;
				}
			}

			/** 
			 * converts xml to json object
			 * @param {object} node xml object
			 * @param {string} path route to current child
			 * @returns {object} json of xml
			 */
			function parseDOMChildren(node, path) {
				if (node.nodeType == DOMNodeTypes.DOCUMENT_NODE) {
					var result = {};
					var nodeChildren = node.childNodes;
					// Alternative for firstElementChild which is not supported in some environments
					for (var cidx = 0; cidx < nodeChildren.length; cidx++) {
						var child = nodeChildren.item(cidx);
						if (child.nodeType == DOMNodeTypes.ELEMENT_NODE) {
							var childName = getNodeLocalName(child);
							result[childName] = parseDOMChildren(child, childName);
						}
					}
					return result;
				} else
				if (node.nodeType == DOMNodeTypes.ELEMENT_NODE) {
					var result = {};
					result.__cnt = 0;

					var nodeChildren = node.childNodes;

					// Children nodes
					for (var cidx = 0; cidx < nodeChildren.length; cidx++) {
						var child = nodeChildren.item(cidx); // nodeChildren[cidx];
						var childName = getNodeLocalName(child);

						if (child.nodeType != DOMNodeTypes.COMMENT_NODE) {
							var childPath = path + "." + childName;
							if (checkXmlElementsFilter(result, child.nodeType, childName, childPath)) {
								result.__cnt++;
								if (result[childName] == null) {
									result[childName] = parseDOMChildren(child, childPath);
									toArrayAccessForm(result, childName, childPath);
								} else {
									if (result[childName] != null) {
										if (!(result[childName] instanceof Array)) {
											result[childName] = [result[childName]];
											toArrayAccessForm(result, childName, childPath);
										}
									}
									(result[childName])[result[childName].length] = parseDOMChildren(child, childPath);
								}
							}
						}
					}

					// Attributes
					for (var aidx = 0; aidx < node.attributes.length; aidx++) {
						var attr = node.attributes.item(aidx); // [aidx];
						result.__cnt++;
						result[config.attributePrefix + attr.name] = attr.value;
					}

					// Node namespace prefix
					var nodePrefix = getNodePrefix(node);
					if (nodePrefix != null && nodePrefix != "") {
						result.__cnt++;
						result.__prefix = nodePrefix;
					}

					if (result["#text"] != null) {
						result.__text = result["#text"];
						if (result.__text instanceof Array) {
							result.__text = result.__text.join("\n");
						}
						//if(config.escapeMode)
						//	result.__text = unescapeXmlChars(result.__text);
						if (config.stripWhitespaces) {
							result.__text = result.__text.trim();
						}
						delete result["#text"];
						if (config.arrayAccessForm == "property") {
							delete result["#text_asArray"];
						}
						result.__text = checkFromXmlDateTimePaths(result.__text, childName, path + "." + childName);
					}
					if (result["#cdata-section"] != null) {
						result.__cdata = result["#cdata-section"];
						delete result["#cdata-section"];
						if (config.arrayAccessForm == "property") {
							delete result["#cdata-section_asArray"];
						}
					}

					if (result.__cnt == 0 && config.emptyNodeForm == "text") {
						result = "";
					} else if (result.__cnt == 1 && result.__text != null) {
						result = result.__text;
					} else if (result.__cnt == 1 && result.__cdata != null && !config.keepCData) {
						result = result.__cdata;
					} else if (result.__cnt > 1 && result.__text != null && config.skipEmptyTextNodesForObj) {
						if ((config.stripWhitespaces && result.__text == "") || (result.__text.trim() == "")) {
							delete result.__text;
						}
					}
					delete result.__cnt;

					if (config.enableToStringFunc && (result.__text != null || result.__cdata != null)) {
						result.toString = function () {
							return (this.__text != null ? this.__text : "") + (this.__cdata != null ? this.__cdata : "");
						};
					}

					return result;
				} else
				if (node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE) {
					return node.nodeValue;
				}
			}

			/** 
			 * creates a start xml tag of given json
			 * @param {object} jsonObj object to make xml for
			 * @param {string} element key name of jsonObj
			 * @param {array} attrList list of attributes
			 * @param {boolean} closed true = no inner objects
			 * @returns {string} xml tag
			 */
			function startTag(jsonObj, element, attrList, closed) {
				var resultStr = "<" + ((jsonObj != null && jsonObj.__prefix != null) ? (jsonObj.__prefix + ":") : "") + element;
				if (attrList != null) {
					for (var aidx = 0; aidx < attrList.length; aidx++) {
						var attrName = attrList[aidx];
						var attrVal = jsonObj[attrName];
						if (config.escapeMode) {
							attrVal = escapeXmlChars(attrVal);
						}
						resultStr += " " + attrName.substr(config.attributePrefix.length) + "=";
						if (config.useDoubleQuotes) {
							resultStr += '"' + attrVal + '"';
						} else {
							resultStr += "'" + attrVal + "'";
						}
					}
				}
				if (closed) {
					resultStr += "/>";
				} else {
					resultStr += ">";
				}
				return resultStr;
			}

			/** 
			 * creates an end xml tag of given json
			 * @param {object} jsonObj object to make xml for
			 * @param {string} elementName key name of jsonObj
			 * @returns {string} end tag for xml
			 */
			function endTag(jsonObj, elementName) {
				return "</" + (jsonObj.__prefix != null ? (jsonObj.__prefix + ":") : "") + elementName + ">";
			}

			/** 
			 * checks if string ends with some suffix
			 * @param {string} str text to check
			 * @param {string} suffix end of text to check
			 * @returns {boolean} true - str contains suffix
			 */
			function endsWith(str, suffix) {
				return str.indexOf(suffix, str.length - suffix.length) !== -1;
			}

			/** 
			 * checks if given object is special
			 * @param {object} jsonObj object to make xml for
			 * @param {string} jsonObjField key name of jsonObj
			 * @returns {boolean} true - is speical element
			 */
			function jsonXmlSpecialElem(jsonObj, jsonObjField) {
				if ((config.arrayAccessForm == "property" && endsWith(jsonObjField.toString(), ("_asArray"))) || jsonObjField.toString().indexOf(
						config.attributePrefix) == 0 || jsonObjField.toString().indexOf("__") == 0 || (jsonObj[jsonObjField] instanceof Function)) {
					return true;
				} else {
					return false;
				}
			}

			/** 
			 * calculates count of xml elements in given json
			 * @param {object} jsonObj object to make xml for
			 * @returns {integer} count of xml elements
			 */
			function jsonXmlElemCount(jsonObj) {
				var elementsCnt = 0;
				if (jsonObj instanceof Object) {
					for (var it in jsonObj) {
						if (jsonXmlSpecialElem(jsonObj, it)) {
							continue;
						}
						elementsCnt++;
					}
				}
				return elementsCnt;
			}

			/** 
			 * checks if object contains some filters
			 * @param {object} jsonObj object to make xml for
			 * @param {string} propertyName key name of jsonObj
			 * @param {string} jsonObjPath path of object
			 * @returns {boolean} true - object contains filter(s)
			 */
			function checkJsonObjPropertiesFilter(jsonObj, propertyName, jsonObjPath) {
				return config.jsonPropertiesFilter.length == 0 || jsonObjPath == "" || checkInStdFiltersArrayForm(config.jsonPropertiesFilter,
					jsonObj, propertyName, jsonObjPath);
			}

			/** 
			 * converts object attributes to array
			 * @param {object} jsonObj object to extract attributes
			 * @returns {array} list of attributes
			 */
			function parseJSONAttributes(jsonObj) {
				var attrList = [];
				if (jsonObj instanceof Object) {
					for (var ait in jsonObj) {
						if (ait.toString().indexOf("__") == -1 && ait.toString().indexOf(config.attributePrefix) == 0) {
							attrList.push(ait);
						}
					}
				}
				return attrList;
			}

			/** 
			 * parses text attribute to xml representation
			 * @param {object} jsonTxtObj object to parse
			 * @returns {string} xml of test arributes
			 */
			function parseJSONTextAttrs(jsonTxtObj) {
				var result = "";

				if (jsonTxtObj.__cdata != null) {
					result += "<![CDATA[" + jsonTxtObj.__cdata + "]]>";
				}

				if (jsonTxtObj.__text != null) {
					if (config.escapeMode) {
						result += escapeXmlChars(jsonTxtObj.__text);
					} else {
						result += jsonTxtObj.__text;
					}
				}
				return result;
			}

			/** 
			 * parses json to xml representation
			 * @param {object} jsonTxtObj object to parse
			 * @returns {string} xml of given object
			 */
			function parseJSONTextObject(jsonTxtObj) {
				var result = "";

				if (jsonTxtObj instanceof Object) {
					result += parseJSONTextAttrs(jsonTxtObj);
				} else if (jsonTxtObj != null) {
					if (config.escapeMode) {
						result += escapeXmlChars(jsonTxtObj);
					} else {
						result += jsonTxtObj;
					}
				}

				return result;
			}

			/** 
			 * returns the path for json property
			 * @param {string} jsonObjPath path to object
			 * @param {string} jsonPropName key name of jsonObj
			 * @returns {string} path to property
			 */
			function getJsonPropertyPath(jsonObjPath, jsonPropName) {
				if (jsonObjPath === "") {
					return jsonPropName;
				} else {
					return jsonObjPath + "." + jsonPropName;
				}
			}

			/** 
			 * converts json attribute to xml
			 * @param {object/array} jsonArrRoot object to make xml for
			 * @param {string} jsonArrObj key name of jsonObj
			 * @param {array} attrList list of attributes
			 * @param {string} jsonObjPath path to object
			 * @returns {string} xml representation of json attribute
			 */
			function parseJSONArray(jsonArrRoot, jsonArrObj, attrList, jsonObjPath) {
				var result = "";
				if (jsonArrRoot.length == 0) {
					result += startTag(jsonArrRoot, jsonArrObj, attrList, true);
				} else {
					for (var arIdx = 0; arIdx < jsonArrRoot.length; arIdx++) {
						result += startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), false);
						result += parseJSONObject(jsonArrRoot[arIdx], getJsonPropertyPath(jsonObjPath, jsonArrObj));
						result += endTag(jsonArrRoot[arIdx], jsonArrObj);
					}
				}
				return result;
			}

			/** 
			 * converts json to xml
			 * @param {object} jsonObj object to make xml for
			 * @param {string} jsonObjPath path to object
			 * @returns {string} xml of jsonObj
			 */
			function parseJSONObject(jsonObj, jsonObjPath) {
				var result = "";

				var elementsCnt = jsonXmlElemCount(jsonObj);

				if (elementsCnt > 0) {
					for (var it in jsonObj) {

						if (jsonXmlSpecialElem(jsonObj, it) || (jsonObjPath != "" && !checkJsonObjPropertiesFilter(jsonObj, it, getJsonPropertyPath(
								jsonObjPath, it)))) {
							continue;
						}

						var subObj = jsonObj[it];

						var attrList = parseJSONAttributes(subObj);

						if (subObj == null || subObj == undefined) {
							result += startTag(subObj, it, attrList, true);
						} else
						if (subObj instanceof Object) {

							if (subObj instanceof Array) {
								result += parseJSONArray(subObj, it, attrList, jsonObjPath);
							} else if (subObj instanceof Date) {
								result += startTag(subObj, it, attrList, false);
								result += subObj.toISOString();
								result += endTag(subObj, it);
							} else {
								var subObjElementsCnt = jsonXmlElemCount(subObj);
								if (subObjElementsCnt > 0 || subObj.__text != null || subObj.__cdata != null) {
									result += startTag(subObj, it, attrList, false);
									result += parseJSONObject(subObj, getJsonPropertyPath(jsonObjPath, it));
									result += endTag(subObj, it);
								} else {
									result += startTag(subObj, it, attrList, true);
								}
							}
						} else {
							result += startTag(subObj, it, attrList, false);
							result += parseJSONTextObject(subObj);
							result += endTag(subObj, it);
						}
					}
				}
				result += parseJSONTextObject(jsonObj);

				return result;
			}

			/** 
			 * converts xml to json
			 * @param {string} xmlDocStr xml as string
			 * @returns {object} json representation of xml
			 */
			this.parseXmlString = function (xmlDocStr) {
				var isIEParser = window.ActiveXObject || "ActiveXObject" in window;
				if (xmlDocStr === undefined) {
					return null;
				}
				var xmlDoc;
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
						xmlDoc = parser.parseFromString(xmlDocStr, "text/xml");
						if (parsererrorNS != null && xmlDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
							//throw new Error('Error parsing XML: '+xmlDocStr);
							xmlDoc = null;
						}
					} catch (err) {
						xmlDoc = null;
					}
				} else {
					// IE :(
					if (xmlDocStr.indexOf("<?") == 0) {
						xmlDocStr = xmlDocStr.substr(xmlDocStr.indexOf("?>") + 2);
					}
					xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
					xmlDoc.async = "false";
					xmlDoc.loadXML(xmlDocStr);
				}
				return xmlDoc;
			};

			/** 
			 * converts property to array
			 * @param {object} prop property to convert
			 * @returns {array} property as array
			 */
			this.asArray = function (prop) {
				if (prop === undefined || prop == null) {
					return [];
				} else {
					if (prop instanceof Array) {
						return prop;
					} else {
						return [prop];
					}
				}
			};

			/** 
			 * converts property to Date
			 * @param {object} dt property to convert
			 * @returns {Date} property as date
			 */
			this.toXmlDateTime = function (dt) {
				if (dt instanceof Date) {
					return dt.toISOString();
				} else {
					if (typeof (dt) === "number") {
						return new Date(dt).toISOString();
					} else {
						return null;
					}
				}
			};

			/** 
			 * converts property to Date with time
			 * @param {object} prop property to convert
			 * @returns {Date} property as Date
			 */
			this.asDateTime = function (prop) {
				if (typeof (prop) == "string") {
					return fromXmlDateTime(prop);
				} else {
					return prop;
				}
			};

			/** 
			 * converts xml childen to json
			 * @param {object} xmlDoc property to convert
			 * @returns {object} parsed xml with children
			 */
			this.xml2json = function (xmlDoc) {
				return parseDOMChildren(xmlDoc);
			};

			/** 
			 * converts xml to json
			 * @param {string} xmlDocStr xml in string form
			 * @returns {object} parsed xml with children
			 */
			this.xml_str2json = function (xmlDocStr) {
				var xmlDoc = this.parseXmlString(xmlDocStr);
				if (xmlDoc != null) {
					return this.xml2json(xmlDoc);
				} else {
					return null;
				}
			};

			/** 
			 * converts json to xml
			 * @param {object} jsonObj json to convert
			 * @returns {string} json representation as xml
			 */
			this.json2xml_str = function (jsonObj) {
				return parseJSONObject(jsonObj, "");
			};

			/** 
			 * converts json to xml
			 * @param {object} jsonObj json to convert
			 * @returns {string} json representation as xml
			 */
			this.json2xml = function (jsonObj) {
				var xmlDocStr = this.json2xml_str(jsonObj);
				return this.parseXmlString(xmlDocStr);
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