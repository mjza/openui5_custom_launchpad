package com.mjzsoft.launchpad.odata.model;

import java.io.Serializable;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.i18n.LocaleContextHolder;

import java.io.IOException;

public abstract class BaseModel implements Serializable {
	private static final long serialVersionUID = 1L;
	private static ObjectMapper mapper = new ObjectMapper();

	protected static final Logger logger = LoggerFactory.getLogger(BaseModel.class);

	@SuppressWarnings("unchecked")
	protected static Map<String, String> jsonToMap(String json) {
		Map<String, String> map = new HashMap<>();
		try {
			// convert JSON string to Map
			if (json != null) {
				map = (Map<String, String>) mapper.readValue(json, Map.class);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		return map;
	}

	protected static String mapToJson(Map<String, String> map) {
		String json = "";
		try {
			// convert map to JSON string
			json = mapper.writeValueAsString(map);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return json;
	}

	protected static String getLang(boolean defaultLang) {
		Locale currentLocale = LocaleContextHolder.getLocale();
		if(defaultLang == true) {
			currentLocale = Locale.ENGLISH;
		}		
		String[] localeStrings = (currentLocale.getLanguage().split("[-_]+"));
		return localeStrings.length > 0 ? localeStrings[0] : "en";
	}
}