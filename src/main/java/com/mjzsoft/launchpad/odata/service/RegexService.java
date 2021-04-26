package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Regex;
import com.mjzsoft.launchpad.odata.repository.RegexRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RegexService implements BaseService<Regex> {
	
	@Autowired
    private RegexRepository formRepository;
	
	@Override
	public Optional<Regex> findById(String id){
		return formRepository.findById(Integer.parseInt(id));
    }
	
	@Override
    public Class<Regex> getType() {
        return Regex.class;
    }
}