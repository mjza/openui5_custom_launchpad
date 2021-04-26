package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Qtype;
import com.mjzsoft.launchpad.odata.repository.QtypeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QtypeService implements BaseService<Qtype> {
	
	@Autowired
    private QtypeRepository qtypeRepository;
	
	@Override
	public Optional<Qtype> findById(String id){
		return qtypeRepository.findById(id);
    }
	
	@Override
    public Class<Qtype> getType() {
        return Qtype.class;
    }
}