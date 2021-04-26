package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Action;
import com.mjzsoft.launchpad.odata.repository.ActionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ActionService implements BaseService<Action> {
	
	@Autowired
    private ActionRepository actionRepository;
	
	@Override
	public Optional<Action> findById(String id){
		return actionRepository.findById(id);
    }
	
	@Override
    public Class<Action> getType() {
        return Action.class;
    }
}