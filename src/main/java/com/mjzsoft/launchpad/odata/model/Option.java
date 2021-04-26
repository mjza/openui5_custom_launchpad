package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;

import java.util.Map;
import java.util.Set;

/**
 * The persistent class for the options database table.
 * 
 */
@Entity
@Table(name="options")
@NamedQuery(name="Option.findAll", query="SELECT o FROM Option o")
public class Option extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", unique=true, nullable=false)
	private int id;
	
	@Lob
	@Column(nullable=false, length=-1)
	private String answer;

	@Column(name="default_answer", nullable=false)
	private boolean defaultAnswer;

	@Column(nullable=false)
	private boolean deleted;

	@Column(nullable=false)
	private int sequence;

	@Column(nullable=false)
	private int value;

	//bi-directional many-to-one association to Answer
	@OneToMany(mappedBy="option")
	private Set<Answer> answers;

	//bi-directional many-to-one association to Question
	@ManyToOne
	@JoinColumn(name="question_id", referencedColumnName = "id", nullable=false)
	private Question question;

	public Option() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}
	
	public String getAnswer() {
		Map<String, String> map = jsonToMap(this.answer);
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

	public void setAnswer(String answer) {
		Map<String, String> map = jsonToMap(this.answer);
		map.put(getLang(false), answer);
		this.answer = mapToJson(map);
	}

	public boolean getDefaultAnswer() {
		return this.defaultAnswer;
	}

	public void setDefaultAnswer(boolean defaultAnswer) {
		this.defaultAnswer = defaultAnswer;
	}

	public boolean getDeleted() {
		return this.deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public int getSequence() {
		return this.sequence;
	}

	public void setSequence(int sequence) {
		this.sequence = sequence;
	}

	public int getValue() {
		return this.value;
	}

	public void setValue(int value) {
		this.value = value;
	}

	public Set<Answer> getAnswers() {
		return this.answers;
	}

	public void setAnswers(Set<Answer> answers) {
		this.answers = answers;
	}

	public Answer addAnswer(Answer answer) {
		getAnswers().add(answer);
		answer.setOption(this);

		return answer;
	}

	public Answer removeAnswer(Answer answer) {
		getAnswers().remove(answer);
		answer.setOption(null);

		return answer;
	}

	public Question getQuestion() {
		return this.question;
	}

	public void setQuestion(Question question) {
		this.question = question;
	}

}