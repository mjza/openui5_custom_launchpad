package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Icon;
import com.mjzsoft.launchpad.odata.repository.IconRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class IconService implements BaseService<Icon> {
	
	@Autowired
    private IconRepository iconRepository;
	
	@Override
	public Optional<Icon> findById(String id){
		return iconRepository.findById(id);
    }
	
	@Override
    public Class<Icon> getType() {
        return Icon.class;
    }
}