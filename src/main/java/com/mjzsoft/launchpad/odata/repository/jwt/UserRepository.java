package com.mjzsoft.launchpad.odata.repository.jwt;

import java.util.Optional;

import com.mjzsoft.launchpad.odata.model.jwt.User;
import com.mjzsoft.launchpad.odata.repository.BaseRepository;

public interface UserRepository extends BaseRepository<User, Long> {

    Optional<User> findById(Long id);
    
    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Boolean existsByEmail(String email);    
    
    public default Optional<User> findById(String id){
    	return this.findById(Long.parseLong(id));
    }
    
    @Override
    public default Class<User> getType() {
        return User.class;
    }
    
    @Override
    public default int sequence(){
    	return 2;
    }
}