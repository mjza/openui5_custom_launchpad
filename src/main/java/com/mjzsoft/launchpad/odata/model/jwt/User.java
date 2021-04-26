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
package com.mjzsoft.launchpad.odata.model.jwt;

import com.mjzsoft.launchpad.odata.model.Answer;
import com.mjzsoft.launchpad.odata.model.Survey;
import com.mjzsoft.launchpad.odata.model.audit.DateAudit;
import com.mjzsoft.launchpad.odata.validation.annotation.NullOrNotBlank;
import org.hibernate.annotations.NaturalId;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.Lob;
import javax.persistence.ManyToMany;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name="users")
@NamedQuery(name="User.findAll", query="SELECT u FROM User u")
public class User extends DateAudit {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Id
    @Column(name = "user_id", unique=true, nullable=true)
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", allocationSize = 1)
    private Long id;

    @NaturalId
    @Column(name = "email", unique = true)
    @NotBlank(message = "User email cannot be null")
    private String email;

    @Column(name = "username", unique = true)
    @NullOrNotBlank(message = "Username can not be blank")
    private String username;

    @Column(name = "password")
    @NotNull(message = "Password cannot be null")
    private String password;

    @Column(name = "first_name")
    @NullOrNotBlank(message = "First name can not be blank")
    private String firstName;

    @Column(name = "last_name")
    @NullOrNotBlank(message = "Last name can not be blank")
    private String lastName;

    @Column(name = "is_active", nullable = false)
    private Boolean active;
    
    
    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "user_has_role", 
    		   joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "user_id")}, 
    		   inverseJoinColumns = {@JoinColumn(name = "role_id", referencedColumnName = "role_id")})
    private Set<Role> roles = new HashSet<>();
    
    @Column(name = "is_email_verified", nullable = false)
    private Boolean emailVerified;
    
    @Lob
	@Column(name="photo_content", nullable = true, length=-1)
	private String photoContent;
    
    //bi-directional many-to-one association to Answer
  	@OneToMany(mappedBy="user")
  	private Set<Answer> answers;

  	//bi-directional many-to-one association to Survey
  	@OneToMany(mappedBy="user")
  	private Set<Survey> surveys;
	    
    public User() {
        super();
    }

    public User(User user) {
        id = user.getId();
        username = user.getUsername();
        password = user.getPassword();
        firstName = user.getFirstName();
        lastName = user.getLastName();
        email = user.getEmail();
        active = user.getActive();
        emailVerified = user.getEmailVerified();
        roles = user.getRoles();
        answers = user.getAnswers();
        surveys = user.getSurveys();
        photoContent = user.getPhotoContent();
    }

    public void markVerificationConfirmed() {
        setEmailVerified(true);
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> authorities) {
        roles = authorities;
    }
    
    public void addRole(Role role) {
        roles.add(role);
        role.getUsers().add(this);
    }

    public void addRoles(Set<Role> roles) {
        roles.forEach(this::addRole);
    }

    public void removeRole(Role role) {
        roles.remove(role);
        role.getUsers().remove(this);
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
    
    
    public String getPhotoContent() {
		return this.photoContent;
	}

	public void setPhotoContent(String photoContent) {
		this.photoContent = photoContent;
	}
    
    public Set<Answer> getAnswers() {
		return this.answers;
	}

	public void setAnswers(Set<Answer> answers) {
		this.answers = answers;
	}

	public Answer addAnswer(Answer answer) {
		getAnswers().add(answer);
		answer.setUser(this);

		return answer;
	}

	public Answer removeAnswer(Answer answer) {
		getAnswers().remove(answer);
		answer.setUser(null);

		return answer;
	}

	public Set<Survey> getSurveys() {
		return this.surveys;
	}

	public void setSurveys(Set<Survey> surveys) {
		this.surveys = surveys;
	}

	public Survey addSurvey(Survey survey) {
		getSurveys().add(survey);
		survey.setUser(this);

		return survey;
	}

	public Survey removeSurvey(Survey survey) {
		getSurveys().remove(survey);
		survey.setUser(null);

		return survey;
	}
    
    @Override
    public String toString() {
        return "User{" + "id=" + id + ", email='" + email + '\'' + ", username='" + username + '\'' + ", password='"
                + password + '\'' + ", firstName='" + firstName + '\'' + ", lastName='" + lastName + '\'' + ", active="
                + active + ", roles=" + roles + ", isEmailVerified=" + emailVerified + '}';
    }
}
