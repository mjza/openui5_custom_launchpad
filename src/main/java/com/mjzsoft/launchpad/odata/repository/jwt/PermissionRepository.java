/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.mjzsoft.launchpad.odata.repository.jwt;

import java.util.Optional;
import com.mjzsoft.launchpad.odata.model.jwt.Permission;
import com.mjzsoft.launchpad.odata.model.jwt.Role;
import com.mjzsoft.launchpad.odata.repository.BaseRepository;

public interface PermissionRepository extends BaseRepository<Permission, Long> {
	
	Optional<Permission> findById(Long id);
	
	Optional<Permission> findByRoleAndSetNameAndCreateAllowed(Role role, String setName, boolean createAllowed);
	
	Optional<Permission> findByRoleAndSetNameAndUpdateAllowed(Role role, String setName, boolean updateAllowed);
	
	Optional<Permission> findByRoleAndSetNameAndReadAllowed(Role role, String setName, boolean readAllowed);
	
	Optional<Permission> findByRoleAndSetNameAndDeleteAllowed(Role role, String setName, boolean deleteAllowed);
	
	public default Optional<Permission> findById(String id){
    	return this.findById(Long.parseLong(id));
    }
    
    @Override
    public default Class<Permission> getType() {
        return Permission.class;
    }
    
    @Override
    public default int sequence(){
    	return 2;
    }
}
