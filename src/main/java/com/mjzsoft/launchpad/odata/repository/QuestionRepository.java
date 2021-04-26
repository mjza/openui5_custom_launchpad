package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Question;

public interface QuestionRepository extends BaseRepository<Question, Integer> {

    Optional<Question> findById(int id);
    
    public default Optional<Question> findById(String id){
    	return this.findById(Integer.parseInt(id));
    }
    
    @Override
    public default Class<Question> getType() {
        return Question.class;
    }
    
    @Override
    public default int sequence(){
    	return 5;
    }
}