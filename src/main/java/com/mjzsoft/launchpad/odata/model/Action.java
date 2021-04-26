package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;
import java.util.Map;
import java.util.Set;

/**
 * The persistent class for the actions database table.
 * 
 */
@Entity
@Table(name = "actions")
@NamedQuery(name = "Action.findAll", query = "SELECT a FROM Action a")
public class Action extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "id", unique = true, nullable = false, length = 255)
	private String id;
	
	@Lob
	@Column(nullable = false, length = -1)
	private String name;

	// bi-directional many-to-one association to Condition
	@OneToMany(mappedBy = "action")
	private Set<Condition> conditions;

	public Action() {
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

	public Set<Condition> getConditions() {
		return this.conditions;
	}

	public void setConditions(Set<Condition> conditions) {
		this.conditions = conditions;
	}

	public Condition addCondition(Condition condition) {
		getConditions().add(condition);
		condition.setAction(this);

		return condition;
	}

	public Condition removeCondition(Condition condition) {
		getConditions().remove(condition);
		condition.setAction(null);

		return condition;
	}

}