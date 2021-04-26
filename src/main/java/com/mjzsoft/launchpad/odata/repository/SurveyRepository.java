package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Survey;

public interface SurveyRepository extends BaseRepository<Survey, Integer> {

    Optional<Survey> findById(int id);
    
    public default Optional<Survey> findById(String id){
    	return this.findById(Integer.parseInt(id));
    }
    
    @Override
    public default Class<Survey> getType() {
        return Survey.class;
    }
    
    @Override
    public default int sequence(){
    	return 4;
    }
    
}