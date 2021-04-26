package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Survey;
import com.mjzsoft.launchpad.odata.repository.SurveyRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SurveyService implements BaseService<Survey> {
	
	@Autowired
    private SurveyRepository surveyRepository;
	
	@Override
	public Optional<Survey> findById(String id){
		return surveyRepository.findById(Integer.parseInt(id));
    }
	
	@Override
    public Class<Survey> getType() {
        return Survey.class;
    }
}