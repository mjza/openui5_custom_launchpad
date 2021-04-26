package com.mjzsoft.launchpad.odata.config;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.MultipartConfigElement;

import org.apache.cxf.jaxrs.servlet.CXFNonSpringJaxrsServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CxfServletRegister {
	
	@Bean
	public ServletRegistrationBean<CXFNonSpringJaxrsServlet> getODataServletRegistrationBean() {
		ServletRegistrationBean<CXFNonSpringJaxrsServlet> odataServletRegistrationBean = new ServletRegistrationBean<CXFNonSpringJaxrsServlet>(new CXFNonSpringJaxrsServlet(), "/odata.svc/*");
		Map<String, String> initParameters = new HashMap<String, String>();
		initParameters.put("javax.ws.rs.Application", "org.apache.olingo.odata2.core.rest.app.ODataApplication");
		initParameters.put("org.apache.olingo.odata2.service.factory", "com.mjzsoft.launchpad.odata.utils.JPAServiceFactory");
		odataServletRegistrationBean.setMultipartConfig(new MultipartConfigElement("")); // <- Added based on https://github.com/jpenninkhof/odata-boilerplate/issues/1 to support batch
		odataServletRegistrationBean.setInitParameters(initParameters);
		return odataServletRegistrationBean;
	}
}
