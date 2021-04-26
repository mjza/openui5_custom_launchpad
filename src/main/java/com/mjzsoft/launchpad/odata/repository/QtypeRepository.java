package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;
import com.mjzsoft.launchpad.odata.model.Qtype;

public interface QtypeRepository extends BaseRepository<Qtype, String> {

    Optional<Qtype> findById(String id);
    
    @Override
    public default Class<Qtype> getType() {
        return Qtype.class;
    }
    
    @Override
    public default int sequence(){
    	return 1;
    }
}