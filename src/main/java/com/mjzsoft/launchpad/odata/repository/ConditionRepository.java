package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Condition;

public interface ConditionRepository extends BaseRepository<Condition, Integer> {

    Optional<Condition> findById(int id);
    
    public default Optional<Condition> findById(String id){
    	return this.findById(Integer.parseInt(id));
    }
    
    @Override
    public default Class<Condition> getType() {
        return Condition.class;
    }
    
    @Override
    public default int sequence(){
    	return 7;
    }
}