package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Condition;
import com.mjzsoft.launchpad.odata.repository.ConditionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ConditionService implements BaseService<Condition> {
	
	@Autowired
    private ConditionRepository conditionRepository;
	
	@Override
	public Optional<Condition> findById(String id){
		return conditionRepository.findById(Integer.parseInt(id));
    }
	
	@Override
    public Class<Condition> getType() {
        return Condition.class;
    }
}