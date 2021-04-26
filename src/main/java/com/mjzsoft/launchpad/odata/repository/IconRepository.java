package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Icon;

public interface IconRepository extends BaseRepository<Icon, String> {

    Optional<Icon> findById(String id);
    
    @Override
    public default Class<Icon> getType() {
        return Icon.class;
    }
    
    @Override
    public default int sequence(){
    	return 1;
    }
}