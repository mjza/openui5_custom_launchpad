package com.mjzsoft.launchpad.odata.model.jwt;

import javax.persistence.*;

import java.io.Serializable;


/**
 * The persistent class for the forms database table.
 * 
 */
@Entity
@Table(name="permissions")
@NamedQuery(name="Permission.findAll", query="SELECT p FROM Permission p")
public class Permission implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "permission_seq")
    @SequenceGenerator(name = "permission_seq", allocationSize = 1)
	@Column(name = "id", unique=true, nullable=false)
	private int id;
	
	//bi-directional many-to-one association to Role
	@ManyToOne
	@JoinColumn(name="role_id", referencedColumnName = "role_id")
	private Role role;
	
	@Column(nullable=false, length=255)
	private String setName;
	
	@Column(nullable=false)
	private boolean createAllowed;
	
	@Column(nullable=false)
	private boolean updateAllowed;
	
	@Column(nullable=false)
	private boolean readAllowed;
	
	@Column(nullable=false)
	private boolean deleteAllowed;

	public Permission() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}
	
	public Role getRole() {
		return this.role;
	}

	public void setRole(Role role) {
		this.role = role;
	}
	
	public String getSetName() {
		return this.setName;
	}

	public void setSetName(String setName) {
		
		this.setName = setName;
	}	

	public boolean getCreateAllowed() {
		return this.createAllowed;
	}

	public void setCreateAllowed(boolean createAllowed) {
		this.createAllowed = createAllowed;
	}
	
	public boolean getUpdateAllowed() {
		return this.updateAllowed;
	}

	public void setUpdateAllowed(boolean updateAllowed) {
		this.updateAllowed = updateAllowed;
	}
	
	public boolean getReadAllowed() {
		return this.readAllowed;
	}

	public void setReadAllowed(boolean readAllowed) {
		this.readAllowed = readAllowed;
	}
	
	public boolean getDeleteAllowed() {
		return this.deleteAllowed;
	}

	public void setDeleteAllowed(boolean deleteAllowed) {
		this.deleteAllowed = deleteAllowed;
	}
}