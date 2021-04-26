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

import com.mjzsoft.launchpad.odata.model.jwt.Role;
import com.mjzsoft.launchpad.odata.model.jwt.RoleName;
import com.mjzsoft.launchpad.odata.model.jwt.User;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
	
	private Long id;

    private String email;
    
    private String username;

    private String firstName;

    private String lastName;
    
    private Boolean active;
    
    private Boolean emailVerified;
    
    private Set<Role> roles = new HashSet<>();    

    public UserResponse(User user) { 
    	id = user.getId();
        username = user.getUsername();
        firstName = user.getFirstName();
        lastName = user.getLastName();
        email = user.getEmail(); 
        active = user.getActive();
        emailVerified = user.getEmailVerified();
        roles = user.getRoles();
    }  
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }   

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }    
    
    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
    
    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
    
    public Boolean isAdmin() {
    	Boolean isAdmin = false;    	
    	Iterator<Role> it = roles.iterator();
        while(!isAdmin && it.hasNext()){
           Role role = it.next();
           if(role.getRoleName().equals(RoleName.ROLE_ADMIN)) {
        	   isAdmin = true;
           }
        }    	
        return isAdmin;
    }
}
