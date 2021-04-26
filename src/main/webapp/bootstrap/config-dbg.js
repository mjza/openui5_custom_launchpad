// sap ushel config file
// https://help.sap.com/doc/saphelp_nw751abap/7.51.0/en-US/65/edb2db3a6b452a97633f0027bf0922/frameset.htm
// https://help.sap.com/doc/saphelp_nw751abap/7.51.0/en-US/61/07ee41f89a43c9af0aa279fe039cca/content.htm?loaded_from_frameset=true
(function () {
	window["sap-ushell-config"] = { // eslint-disable-line
		defaultRenderer: "fiori2",
		renderers: {
			fiori2: {
				componentData: {
					config: {
						enableSearch: false,
						enableUserDefaultParameters: false,
						rootIntent: "Shell-home"
					}
				}
			}
		},
		services: {
			NavTargetResolution: {
				config: {
					"runStandaloneAppFolderWhitelist": {
						"*": true
					},
					"allowTestUrlComponentConfig": false,
					"enableClientSideTargetResolution": true
				}
			},
			SupportTicket: {
				// switched off as the local adapter is not connected to a ticket system
				config: {
					enabled: false
				}
			},
			EndUserFeedback: {
				adapter: {
					config: {
						enabled: false
					}
				}
			},
			SmartNavigation: {
				config: {
					isTrackingEnabled: true
				}
			}
		}
	};
})();