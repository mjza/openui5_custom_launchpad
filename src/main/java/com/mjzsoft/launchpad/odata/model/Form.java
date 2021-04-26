package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;
import java.util.Calendar;
import java.util.Map;
import java.util.Set;


/**
 * The persistent class for the forms database table.
 * 
 */
@Entity
@Table(name="forms")
@NamedQuery(name="Form.findAll", query="SELECT f FROM Form f")
public class Form extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", unique=true, nullable=false)
	private int id;

	@Column(nullable=false)
	private boolean deleted;
	
	@Column(nullable=false)
	private boolean universal;
	
	@Lob
	@Column(nullable=false, length=-1)
	private String name;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="valid_from", nullable=false)
	private Calendar validFrom;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="valid_to", nullable=false)
	private Calendar validTo;

	//bi-directional many-to-one association to Icon
	@ManyToOne
	@JoinColumn(name="icon_id", referencedColumnName = "id")
	private Icon icon;

	//bi-directional many-to-one association to Question
	@OneToMany(mappedBy="form")
	private Set<Question> questions;

	//bi-directional many-to-one association to Survey
	@OneToMany(mappedBy="form")
	private Set<Survey> surveys;

	public Form() {
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
	
	public boolean getUniversal() {
		return this.universal;
	}

	public void setUniversal(boolean universal) {
		this.universal = universal;
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

	public Calendar getValidFrom() {
		return this.validFrom;
	}

	public void setValidFrom(Calendar validFrom) {
		this.validFrom = validFrom;
	}

	public Calendar getValidTo() {
		return this.validTo;
	}

	public void setValidTo(Calendar validTo) {
		this.validTo = validTo;
	}

	public Icon getIcon() {
		return this.icon;
	}

	public void setIcon(Icon icon) {
		this.icon = icon;
	}

	public Set<Question> getQuestions() {
		return this.questions;
	}

	public void setQuestions(Set<Question> questions) {
		this.questions = questions;
	}

	public Question addQuestion(Question question) {
		getQuestions().add(question);
		question.setForm(this);

		return question;
	}

	public Question removeQuestion(Question question) {
		getQuestions().remove(question);
		question.setForm(null);

		return question;
	}

	public Set<Survey> getSurveys() {
		return this.surveys;
	}

	public void setSurveys(Set<Survey> surveys) {
		this.surveys = surveys;
	}

	public Survey addSurvey(Survey survey) {
		getSurveys().add(survey);
		survey.setForm(this);

		return survey;
	}

	public Survey removeSurvey(Survey survey) {
		getSurveys().remove(survey);
		survey.setForm(null);

		return survey;
	}

}