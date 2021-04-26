package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Answer;
import com.mjzsoft.launchpad.odata.repository.AnswerRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnswerService implements BaseService<Answer> {
	
	@Autowired
    private AnswerRepository answerRepository;
	
	@Override
	public Optional<Answer> findById(String id){
		return answerRepository.findById(Integer.parseInt(id));
    }
	
	@Override
    public Class<Answer> getType() {
        return Answer.class;
    }
}