package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;

import java.util.Map;
import java.util.Set;


/**
 * The persistent class for the operators database table.
 * 
 */
@Entity
@Table(name="operators")
@NamedQuery(name="Operator.findAll", query="SELECT o FROM Operator o")
public class Operator extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "id", unique=true, nullable=false, length=255)
	private String id;
	
	@Lob
	@Column(nullable=false, length=-1)
	private String name;

	@Column(name="ui5_operator", nullable=false, length=255)
	private String ui5Operator;

	//bi-directional many-to-one association to Condition
	@OneToMany(mappedBy="operator")
	private Set<Condition> conditions;

	public Operator() {
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

	public String getUi5Operator() {
		return this.ui5Operator;
	}

	public void setUi5Operator(String ui5Operator) {
		this.ui5Operator = ui5Operator;
	}

	public Set<Condition> getConditions() {
		return this.conditions;
	}

	public void setConditions(Set<Condition> conditions) {
		this.conditions = conditions;
	}

	public Condition addCondition(Condition condition) {
		getConditions().add(condition);
		condition.setOperator(this);

		return condition;
	}

	public Condition removeCondition(Condition condition) {
		getConditions().remove(condition);
		condition.setOperator(null);

		return condition;
	}

}