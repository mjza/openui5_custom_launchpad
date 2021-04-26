/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.mjzsoft.launchpad.odata.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.ApiKey;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@EnableSwagger2
@Configuration
public class SwaggerConfig {
		
    @Bean
    public Docket authApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.mjzsoft.launchpad.odata"))
                .paths(PathSelectors.regex("/api/auth/.*"))
                .build()
                .groupName("auth")
                .apiInfo(authMetaInfo());
    }

    private ApiInfo authMetaInfo() {
        return new ApiInfoBuilder()
                .description("Backend API For the Auth Service")
                .title("Auth API")
                .version("V1.0.0")
                .build();
    }
    
    @Bean
    public Docket userApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.mjzsoft.launchpad.odata"))
                .paths(PathSelectors.regex("/api/user/.*"))
                .build()
                .groupName("user")
                .apiInfo(userMetaInfo())
                .securitySchemes(Arrays.asList(apiKey()));
    }

    private ApiInfo userMetaInfo() {
        return new ApiInfoBuilder()
                .description("Backend API For the User Service")
                .title("User API")
                .version("V1.0.0")
                .build();
    }
    
    private ApiKey apiKey() {
        return new ApiKey("jwtToken", "Authorization", "header");
    }

}
