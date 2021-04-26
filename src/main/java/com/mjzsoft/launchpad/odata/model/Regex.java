package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;
import java.util.Map;

/**
 * The persistent class for the regexes database table.
 * 
 */
@Entity
@Table(name = "regexes")
@NamedQuery(name = "Regex.findAll", query = "SELECT a FROM Regex a")
public class Regex extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", unique=true, nullable=false)
	private int id;
	
	@Lob
	@Column(nullable = false, length = -1)
	private String name;

	@Lob
	@Column(nullable = false, length = -1)
	private String expression;

	public Regex() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
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

	public String getExpression() {
		return this.expression;
	}

	public void setExpression(String expression) {
		this.expression = expression;
	}

}