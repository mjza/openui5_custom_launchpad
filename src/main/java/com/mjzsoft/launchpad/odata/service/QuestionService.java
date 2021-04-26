package com.mjzsoft.launchpad.odata.service;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Question;
import com.mjzsoft.launchpad.odata.repository.QuestionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuestionService implements BaseService<Question> {
	
	@Autowired
    private QuestionRepository questionRepository;
	
	@Override
	public Optional<Question> findById(String id){
		return questionRepository.findById(Integer.parseInt(id));
    }
	
	@Override
    public Class<Question> getType() {
        return Question.class;
    }
}