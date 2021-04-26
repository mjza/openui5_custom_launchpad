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
package com.mjzsoft.launchpad.odata.service.jwt;

import com.mjzsoft.launchpad.odata.model.jwt.Permission;
import com.mjzsoft.launchpad.odata.repository.jwt.PermissionRepository;
import com.mjzsoft.launchpad.odata.service.BaseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Optional;

@Service
public class PermissionService implements BaseService<Permission> {

	private final PermissionRepository permissionRepository;

    @Autowired
    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    /**
     * Find all roles from the database
     */
    public Collection<Permission> findAll() {
        return permissionRepository.findAll();
    }

	@Override
	public Class<Permission> getType() {
		return Permission.class;
	}

	@Override
	public Optional<Permission> findById(String id) {
		return permissionRepository.findById(id);
	}
	
}
