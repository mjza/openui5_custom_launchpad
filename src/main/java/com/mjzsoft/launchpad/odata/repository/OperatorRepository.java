package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;
import com.mjzsoft.launchpad.odata.model.Operator;

public interface OperatorRepository extends BaseRepository<Operator, String> {

    Optional<Operator> findById(String id);
    
    @Override
    public default Class<Operator> getType() {
        return Operator.class;
    }
    
    @Override
    public default int sequence(){
    	return 1;
    }
}