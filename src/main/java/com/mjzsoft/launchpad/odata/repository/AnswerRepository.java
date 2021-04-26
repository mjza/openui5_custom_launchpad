package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Answer;

public interface AnswerRepository extends BaseRepository<Answer, Integer> {

    Optional<Answer> findById(int id);
    
    public default Optional<Answer> findById(String id){
    	return this.findById(Integer.parseInt(id));
    }
    
    @Override
    public default Class<Answer> getType() {
        return Answer.class;
    }
    
    @Override
    public default int sequence(){
    	return 8;
    }
}