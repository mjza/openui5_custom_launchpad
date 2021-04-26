package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Option;
import com.mjzsoft.launchpad.odata.repository.OptionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OptionService implements BaseService<Option> {
	
	@Autowired
    private OptionRepository optionRepository;
	
	@Override
	public Optional<Option> findById(String id){
		return id.isEmpty() ? Optional.empty() : optionRepository.findById(Integer.parseInt(id));
    }
	
	@Override
    public Class<Option> getType() {
        return Option.class;
    }
}