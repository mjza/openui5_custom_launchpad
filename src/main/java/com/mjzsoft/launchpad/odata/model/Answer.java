package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;

import com.mjzsoft.launchpad.odata.model.jwt.User;


/**
 * The persistent class for the answers database table.
 * 
 */
@Entity
@Table(name="answers")
@NamedQuery(name="Answer.findAll", query="SELECT a FROM Answer a")
public class Answer extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", unique=true, nullable=false)
	private int id;

	@Column(length=255)
	private String answer;

	//bi-directional many-to-one association to Option
	@ManyToOne
	@JoinColumn(name="option_id", referencedColumnName = "id")
	private Option option;

	//bi-directional many-to-one association to Question
	@ManyToOne
	@JoinColumn(name="question_id", referencedColumnName = "id", nullable=false)
	private Question question;

	//bi-directional many-to-one association to User
	@ManyToOne
	@JoinColumn(name="user_id", nullable=false)
	private User user;

	public Answer() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getAnswer() {
		return this.answer;
	}

	public void setAnswer(String answer) {
		this.answer = answer;
	}

	public Option getOption() {
		return this.option;
	}

	public void setOption(Option option) {
		this.option = option;
	}

	public Question getQuestion() {
		return this.question;
	}

	public void setQuestion(Question question) {
		this.question = question;
	}

	public User getUser() {
		return this.user;
	}

	public void setUser(User user) {
		this.user = user;
	}

}