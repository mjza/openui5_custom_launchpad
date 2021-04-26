package com.mjzsoft.launchpad.odata.model;

import javax.persistence.*;

import java.util.Map;
import java.util.Set;


/**
 * The persistent class for the icons database table.
 * 
 */
@Entity
@Table(name="icons")
@NamedQuery(name="Icon.findAll", query="SELECT i FROM Icon i")
public class Icon extends BaseModel {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "id", unique=true, nullable=false, length=255)
	private String id;
	
	@Lob
	@Column(nullable=false, length=-1)
	private String name;

	@Column(nullable=false, length=255)
	private String source;

	//bi-directional many-to-one association to Form
	@OneToMany(mappedBy="icon")
	private Set<Form> forms;

	public Icon() {
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

	public String getSource() {
		return this.source;
	}

	public void setSource(String source) {
		this.source = source;
	}

	public Set<Form> getForms() {
		return this.forms;
	}

	public void setForms(Set<Form> forms) {
		this.forms = forms;
	}

	public Form addForm(Form form) {
		getForms().add(form);
		form.setIcon(this);

		return form;
	}

	public Form removeForm(Form form) {
		getForms().remove(form);
		form.setIcon(null);

		return form;
	}

}