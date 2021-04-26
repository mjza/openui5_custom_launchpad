package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Option;

public interface OptionRepository extends BaseRepository<Option, Integer> {

    Optional<Option> findById(int id);
    
    public default Optional<Option> findById(String id){
    	return this.findById(Integer.parseInt(id));
    }
    
    @Override
    public default Class<Option> getType() {
        return Option.class;
    }
    
    @Override
    public default int sequence(){
    	return 6;
    }
}