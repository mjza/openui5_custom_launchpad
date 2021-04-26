package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Action;

public interface ActionRepository extends BaseRepository<Action, String> {

    Optional<Action> findById(String id);
    
    @Override
    public default Class<Action> getType() {
        return Action.class;
    }
    
    @Override
    public default int sequence(){
    	return 1;
    }
}