package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Operator;
import com.mjzsoft.launchpad.odata.repository.OperatorRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OperatorService implements BaseService<Operator> {
	
	@Autowired
    private OperatorRepository operatorRepository;
	
	@Override
	public Optional<Operator> findById(String id){
		return operatorRepository.findById(id);
    }
	
	@Override
    public Class<Operator> getType() {
        return Operator.class;
    }
}