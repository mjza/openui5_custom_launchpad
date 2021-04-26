package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;

import com.mjzsoft.launchpad.odata.model.jwt.User;

import java.util.Calendar;


/**
 * The persistent class for the surveys database table.
 * 
 */
@Entity
@Table(name="surveys")
@NamedQuery(name="Survey.findAll", query="SELECT s FROM Survey s")
public class Survey extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", unique=true, nullable=false)
	private int id;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="done_at")
	private Calendar doneAt;

	//bi-directional many-to-one association to Form
	@ManyToOne
	@JoinColumn(name="form_id", referencedColumnName = "id", nullable=false)
	private Form form;

	//bi-directional many-to-one association to User
	@ManyToOne
	@JoinColumn(name="user_id", nullable=false)
	private User user;

	public Survey() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Calendar getDoneAt() {
		return this.doneAt;
	}

	public void setDoneAt(Calendar doneAt) {
		this.doneAt = doneAt;
	}

	public Form getForm() {
		return this.form;
	}

	public void setForm(Form form) {
		this.form = form;
	}

	public User getUser() {
		return this.user;
	}

	public void setUser(User user) {
		this.user = user;
	}

}