package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;

import java.util.Map;
import java.util.Set;


/**
 * The persistent class for the questions database table.
 * 
 */
@Entity
@Table(name="questions")
@NamedQuery(name="Question.findAll", query="SELECT q FROM Question q")
public class Question extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", unique=true, nullable=false)
	private int id;

	@Column(nullable=false)
	private Boolean deleted;

	@Column(nullable=false)
	private boolean mandatory;
	
	@Lob
	@Column(nullable=false, length=-1)
	private String question;

	@Column(name="random_weight", nullable=false)
	private double randomWeight;

	@Column(nullable=false)
	private int sequence;
	
	@Lob
	@Column(nullable = true, length = -1)
	private String regex;

	//bi-directional many-to-one association to Answer
	@OneToMany(mappedBy="question")
	private Set<Answer> answers;

	//bi-directional many-to-one association to Condition
	@OneToMany(mappedBy="question1")
	private Set<Condition> conditions1;

	//bi-directional many-to-one association to Condition
	@OneToMany(mappedBy="question2")
	private Set<Condition> conditions2;

	//bi-directional many-to-one association to Option
	@OneToMany(mappedBy="question")
	private Set<Option> options;

	//bi-directional many-to-one association to Form
	@ManyToOne
	@JoinColumn(name="form_id", referencedColumnName = "id", nullable=false)
	private Form form;

	//bi-directional many-to-one association to Qtype
	@ManyToOne
	@JoinColumn(name="qtype_id", referencedColumnName = "id", nullable=false)
	private Qtype qtype;

	public Question() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Boolean getDeleted() {
		return this.deleted;
	}

	public void setDeleted(Boolean deleted) {
		this.deleted = deleted;
	}

	public boolean getMandatory() {
		return this.mandatory;
	}

	public void setMandatory(boolean mandatory) {
		this.mandatory = mandatory;
	}
	
	public String getQuestion() {
		Map<String, String> map = jsonToMap(this.question);
		String value = map.get(getLang(false));
		if(value == null) {
			value = map.get(getLang(true));
		}
		if(value == null && map.size() > 0) {
			String key = (String) map.keySet().toArray()[0];
			value = map.get(key);
		}
		return value;
	}

	public void setQuestion(String question) {
		Map<String, String> map = jsonToMap(this.question);
		map.put(getLang(false), question);
		this.question = mapToJson(map);
	}

	public double getRandomWeight() {
		return this.randomWeight;
	}

	public void setRandomWeight(double randomWeight) {
		this.randomWeight = randomWeight;
	}

	public int getSequence() {
		return this.sequence;
	}

	public void setSequence(int sequence) {
		this.sequence = sequence;
	}
	
	public String getRegex() {
		return this.regex;
	}

	public void setRegex(String regex) {
		this.regex = regex;
	}

	public Set<Answer> getAnswers() {
		return this.answers;
	}

	public void setAnswers(Set<Answer> answers) {
		this.answers = answers;
	}

	public Answer addAnswer(Answer answer) {
		getAnswers().add(answer);
		answer.setQuestion(this);

		return answer;
	}

	public Answer removeAnswer(Answer answer) {
		getAnswers().remove(answer);
		answer.setQuestion(null);

		return answer;
	}

	public Set<Condition> getConditions1() {
		return this.conditions1;
	}

	public void setConditions1(Set<Condition> conditions1) {
		this.conditions1 = conditions1;
	}

	public Condition addConditions1(Condition conditions1) {
		getConditions1().add(conditions1);
		conditions1.setQuestion1(this);

		return conditions1;
	}

	public Condition removeConditions1(Condition conditions1) {
		getConditions1().remove(conditions1);
		conditions1.setQuestion1(null);

		return conditions1;
	}

	public Set<Condition> getConditions2() {
		return this.conditions2;
	}

	public void setConditions2(Set<Condition> conditions2) {
		this.conditions2 = conditions2;
	}

	public Condition addConditions2(Condition conditions2) {
		getConditions2().add(conditions2);
		conditions2.setQuestion2(this);

		return conditions2;
	}

	public Condition removeConditions2(Condition conditions2) {
		getConditions2().remove(conditions2);
		conditions2.setQuestion2(null);

		return conditions2;
	}

	public Set<Option> getOptions() {
		return this.options;
	}

	public void setOptions(Set<Option> options) {
		this.options = options;
	}

	public Option addOption(Option option) {
		getOptions().add(option);
		option.setQuestion(this);

		return option;
	}

	public Option removeOption(Option option) {
		getOptions().remove(option);
		option.setQuestion(null);

		return option;
	}

	public Form getForm() {
		return this.form;
	}

	public void setForm(Form form) {
		this.form = form;
	}

	public Qtype getQtype() {
		return this.qtype;
	}

	public void setQtype(Qtype qtype) {
		this.qtype = qtype;
	}

}