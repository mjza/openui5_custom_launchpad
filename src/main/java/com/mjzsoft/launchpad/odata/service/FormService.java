package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Form;
import com.mjzsoft.launchpad.odata.repository.FormRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FormService implements BaseService<Form> {
	
	@Autowired
    private FormRepository formRepository;
	
	@Override
	public Optional<Form> findById(String id){
		return formRepository.findById(Integer.parseInt(id));
    }
	
	@Override
    public Class<Form> getType() {
        return Form.class;
    }
}