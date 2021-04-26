package com.mjzsoft.launchpad.odata.repository;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.Form;

public interface FormRepository extends BaseRepository<Form, Integer> {

    Optional<Form> findById(int id);
    
    public default Optional<Form> findById(String id){
    	return this.findById(Integer.parseInt(id));
    }
    
    @Override
    public default Class<Form> getType() {
        return Form.class;
    }
        
    @Override
    public default int sequence(){
    	return 3;
    }
}