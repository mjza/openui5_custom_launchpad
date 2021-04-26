package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;


/**
 * The persistent class for the conditions database table.
 * 
 */
@Entity
@Table(name="conditions")
@NamedQuery(name="Condition.findAll", query="SELECT c FROM Condition c")
public class Condition extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", unique=true, nullable=false)
	private int id;

	@Column(nullable=false)
	private boolean deleted;

	@Column(nullable=false, length=255)
	private String operand1;

	@Column(length=255)
	private String operand2;

	//bi-directional many-to-one association to Action
	@ManyToOne
	@JoinColumn(name="action_id", referencedColumnName = "id", nullable=false)
	private Action action;

	//bi-directional many-to-one association to Operator
	@ManyToOne
	@JoinColumn(name="operator_id", referencedColumnName = "id", nullable=false)
	private Operator operator;

	//bi-directional many-to-one association to Question
	@ManyToOne
	@JoinColumn(name="question_source_id", referencedColumnName = "id", nullable=false)
	private Question question1;

	//bi-directional many-to-one association to Question
	@ManyToOne
	@JoinColumn(name="question_target_id", referencedColumnName = "id", nullable=false)
	private Question question2;

	public Condition() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public boolean getDeleted() {
		return this.deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public String getOperand1() {
		return this.operand1;
	}

	public void setOperand1(String operand1) {
		this.operand1 = operand1;
	}

	public String getOperand2() {
		return this.operand2;
	}

	public void setOperand2(String operand2) {
		this.operand2 = operand2;
	}

	public Action getAction() {
		return this.action;
	}

	public void setAction(Action action) {
		this.action = action;
	}

	public Operator getOperator() {
		return this.operator;
	}

	public void setOperator(Operator operator) {
		this.operator = operator;
	}

	public Question getQuestion1() {
		return this.question1;
	}

	public void setQuestion1(Question question1) {
		this.question1 = question1;
	}

	public Question getQuestion2() {
		return this.question2;
	}

	public void setQuestion2(Question question2) {
		this.question2 = question2;
	}

}