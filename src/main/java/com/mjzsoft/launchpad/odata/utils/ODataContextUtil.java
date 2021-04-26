package com.mjzsoft.launchpad.odata.utils;

import java.util.Locale;
import java.util.ResourceBundle;

import org.apache.olingo.odata2.api.processor.ODataContext;

public class ODataContextUtil {

	private static ThreadLocal<ODataContext> oDataContext = new ThreadLocal<ODataContext>(); 
	
	public static void setODataContext(ODataContext c) {
		oDataContext.set(c);
	}
	
	public static ODataContext getODataContext() {
		return oDataContext.get();
	}
	
	public static ResourceBundle getResourceBundle(String name, Locale locale) {
		ResourceBundle i18n = null;
		// TODO why oDataContext.get() != null ? it works without
	//	if (oDataContext.get() != null) {
	 		i18n = ResourceBundle.getBundle(name, locale);
	//	}
		return i18n;
	}
}
