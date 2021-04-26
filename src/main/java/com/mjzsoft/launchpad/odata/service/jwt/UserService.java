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

import com.mjzsoft.launchpad.odata.annotation.CurrentUser;
import com.mjzsoft.launchpad.odata.exception.UserLogoutException;
import com.mjzsoft.launchpad.odata.model.jwt.CustomUserDetails;
import com.mjzsoft.launchpad.odata.model.jwt.Role;
import com.mjzsoft.launchpad.odata.model.jwt.User;
import com.mjzsoft.launchpad.odata.model.jwt.UserDevice;
import com.mjzsoft.launchpad.odata.model.payload.LogOutRequest;
import com.mjzsoft.launchpad.odata.model.payload.RegistrationRequest;
import com.mjzsoft.launchpad.odata.repository.jwt.UserRepository;
import com.mjzsoft.launchpad.odata.service.BaseService;

import com.mjzsoft.launchpad.odata.utils.ODataContextUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService implements BaseService<User> {

	private static final Logger logger = LoggerFactory.getLogger(UserService.class);
	private final PasswordEncoder passwordEncoder;
	private final UserRepository userRepository;
	private final RoleService roleService;
	private final UserDeviceService userDeviceService;
	private final RefreshTokenService refreshTokenService;

	@Autowired
	public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository, RoleService roleService,
			UserDeviceService userDeviceService, RefreshTokenService refreshTokenService) {
		this.passwordEncoder = passwordEncoder;
		this.userRepository = userRepository;
		this.roleService = roleService;
		this.userDeviceService = userDeviceService;
		this.refreshTokenService = refreshTokenService;
	}

	/**
	 * Finds a user in the database by username
	 */
	public Optional<User> findByUsername(String username) {
		return userRepository.findByUsername(username);
	}

	/**
	 * Finds a user in the database by email
	 */
	public Optional<User> findByEmail(String email) {
		return userRepository.findByEmail(email);
	}

	/**
	 * Find a user in db by id.
	 */
	public Optional<User> findById(Long Id) {
		return userRepository.findById(Id);
	}

	/**
	 * Save the user to the database
	 */
	public User save(User user) {
		logger.info(user.toString());
		return userRepository.save(user);
	}

	/**
	 * Check is the user exists given the email: naturalId
	 */
	public Boolean existsByEmail(String email) {
		return userRepository.existsByEmail(email);
	}

	/**
	 * Check is the user exists given the username: naturalId
	 */
	public Boolean existsByUsername(String username) {
		return userRepository.existsByUsername(username);
	}

	/**
	 * Creates a new user from the registration request
	 */
	public User createUser(RegistrationRequest registerRequest) {
		User newUser = new User();
		Boolean isNewUserAsAdmin = registerRequest.getRegisterAsAdmin();
		newUser.setEmail(registerRequest.getEmail());
		newUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
		newUser.setUsername(registerRequest.getUsername());
		newUser.setFirstName(registerRequest.getFirstName());
		newUser.setLastName(registerRequest.getLastName());
		newUser.addRoles(getRolesForNewUser(isNewUserAsAdmin));
		newUser.setActive(true);
		newUser.setEmailVerified(false);
		return newUser;
	}

	/**
	 * Performs a quick check to see what roles the new user could be assigned to.
	 *
	 * @return list of roles for the new user
	 */
	private Set<Role> getRolesForNewUser(Boolean isToBeMadeAdmin) {
		Set<Role> newUserRoles = new HashSet<>(roleService.findAll());
		if (!isToBeMadeAdmin) {
			newUserRoles.removeIf(Role::isAdminRole);
		}
		logger.info("Setting user roles: " + newUserRoles);
		return newUserRoles;
	}

	/**
	 * Log the given user out and delete the refresh token associated with it. If no
	 * device id is found matching the database for the given user, throw a log out
	 * exception.
	 */
	public void logoutUser(@CurrentUser CustomUserDetails currentUser, LogOutRequest logOutRequest) {
		String deviceId = logOutRequest.getDeviceInfo().getDeviceId();
		UserDevice userDevice = userDeviceService.findByUserId(currentUser.getId())
				.filter(device -> device.getDeviceId().equals(deviceId))
				.orElseThrow(() -> {
					Locale locale = LocaleContextHolder.getLocale();
					String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ErrorInvalidDeviceId");
					return new UserLogoutException(logOutRequest.getDeviceInfo().getDeviceId(), pattern);
				});

		logger.info("Removing refresh token associated with device [" + userDevice + "]");
		refreshTokenService.deleteById(userDevice.getRefreshToken().getId());
	}

	@Override
	public Class<User> getType() {
		return User.class;
	}

	@Override
	public Optional<User> findById(String id) {
		return userRepository.findById(id);
	}
}
