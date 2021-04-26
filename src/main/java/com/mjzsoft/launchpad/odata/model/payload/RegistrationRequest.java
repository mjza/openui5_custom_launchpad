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
package com.mjzsoft.launchpad.odata.model.payload;

import com.mjzsoft.launchpad.odata.validation.annotation.NullOrNotBlank;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

import javax.validation.constraints.NotNull;

@ApiModel(value = "Registration Request", description = "The registration request payload")
public class RegistrationRequest {

	@NullOrNotBlank(message = "Registration first name can be null but not blank")
    @ApiModelProperty(value = "A non empty first name", allowableValues = "NonEmpty String")
    private String firstName;
	
	@NullOrNotBlank(message = "Registration last name can be null but not blank")
    @ApiModelProperty(value = "A non empty last name", allowableValues = "NonEmpty String")
    private String lastName;
	
	
    @NullOrNotBlank(message = "Registration username can be null but not blank")
    @ApiModelProperty(value = "A valid username", allowableValues = "NonEmpty String")
    private String username;

    @NullOrNotBlank(message = "Registration email can be null but not blank")
    @ApiModelProperty(value = "A valid email", required = true, allowableValues = "NonEmpty String")
    private String email;

    @NotNull(message = "Registration password cannot be null")
    @ApiModelProperty(value = "A valid password string", required = true, allowableValues = "NonEmpty String")
    private String password;

    @NotNull(message = "Specify whether the user has to be registered as an admin or not")
    @ApiModelProperty(value = "Flag denoting whether the user is an admin or not", required = true,
            dataType = "boolean", allowableValues = "true, false")
    private Boolean registerAsAdmin;

    public RegistrationRequest(String firstName, String lastName, String username, String email,
                               String password, Boolean registerAsAdmin) {
    	this.firstName = firstName;
    	this.lastName = lastName;
    	this.username = username;
        this.email = email;
        this.password = password;
        this.registerAsAdmin = registerAsAdmin;
    }

    public RegistrationRequest() {
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getRegisterAsAdmin() {
        return registerAsAdmin;
    }

    public void setRegisterAsAdmin(Boolean registerAsAdmin) {
        this.registerAsAdmin = registerAsAdmin;
    }
    
    @ApiModelProperty(required = false, hidden = true)
    public Boolean isValid() {
    	if(this.getEmail() == null || this.getEmail().trim().length() == 0) {
    		return false;
    	}
    	if(this.getUsername() == null || this.getUsername().trim().length() == 0) {
    		return false;
    	}
    	if(this.getPassword() == null || this.getPassword().trim().length() == 0) {
    		return false;
    	}
    	return true;
    }
    
    @ApiModelProperty(required = false, hidden = true)
    public String getMissingField() {
    	if(this.getEmail() == null || this.getEmail().trim().length() == 0) {
    		return "email";
    	}
    	if(this.getUsername() == null || this.getUsername().trim().length() == 0) {
    		return "username";
    	}
    	if(this.getPassword() == null || this.getPassword().trim().length() == 0) {
    		return "password";
    	}
    	return null;
    }
}
