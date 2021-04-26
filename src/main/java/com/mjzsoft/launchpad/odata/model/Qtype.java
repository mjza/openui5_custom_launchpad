package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;

import java.util.Map;
import java.util.Set;


/**
 * The persistent class for the qtypes database table.
 * 
 */
@Entity
@Table(name="qtypes")
@NamedQuery(name="Qtype.findAll", query="SELECT q FROM Qtype q")
public class Qtype extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "id", unique=true, nullable=false, length=255)
	private String id;
	
	@Lob
	@Column(nullable=false, length=-1)
	private String name;

	@Column(name="ui5_class", nullable=false, length=255)
	private String ui5Class;

	//bi-directional many-to-one association to Question
	@OneToMany(mappedBy="qtype")
	private Set<Question> questions;

	public Qtype() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		Map<String, String> map = jsonToMap(this.name);
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

	public void setName(String name) {
		Map<String, String> map = jsonToMap(this.name);
		map.put(getLang(false), name);
		this.name = mapToJson(map);
	}

	public String getUi5Class() {
		return this.ui5Class;
	}

	public void setUi5Class(String ui5Class) {
		this.ui5Class = ui5Class;
	}

	public Set<Question> getQuestions() {
		return this.questions;
	}

	public void setQuestions(Set<Question> questions) {
		this.questions = questions;
	}

	public Question addQuestion(Question question) {
		getQuestions().add(question);
		question.setQtype(this);

		return question;
	}

	public Question removeQuestion(Question question) {
		getQuestions().remove(question);
		question.setQtype(null);

		return question;
	}

}