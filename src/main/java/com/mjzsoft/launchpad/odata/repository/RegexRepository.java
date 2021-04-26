package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Regex;

public interface RegexRepository extends BaseRepository<Regex, Integer> {

    Optional<Regex> findById(int id);
    
    public default Optional<Regex> findById(String id){
    	return this.findById(Integer.parseInt(id));
    }
    
    @Override
    public default Class<Regex> getType() {
        return Regex.class;
    }
        
    @Override
    public default int sequence(){
    	return 1;
    }
}