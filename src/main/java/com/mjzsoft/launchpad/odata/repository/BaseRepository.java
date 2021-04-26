package com.mjzsoft.launchpad.odata.repository;

import java.io.Serializable;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface BaseRepository<T, ID extends Serializable> extends JpaRepository<T, ID> {   
	public Optional<T> findById(String id);
    public Class<T> getType();
    public default int sequence(){
    	return 1;
    }
}