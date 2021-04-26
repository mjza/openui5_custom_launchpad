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
import com.mjzsoft.launchpad.odata.model.jwt.Role;
import com.mjzsoft.launchpad.odata.repository.BaseRepository;

public interface RoleRepository extends BaseRepository<Role, Long> {
	Optional<Role> findById(Long id);
	
	public default Optional<Role> findById(String id){
    	return this.findById(Long.parseLong(id));
    }
    
    @Override
    public default Class<Role> getType() {
        return Role.class;
    }
    
    @Override
    public default int sequence(){
    	return 1;
    }
}
