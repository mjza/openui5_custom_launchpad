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
package com.mjzsoft.launchpad.odata.controller;

import com.mjzsoft.launchpad.odata.annotation.CurrentUser;
import com.mjzsoft.launchpad.odata.event.OnUserAccountChangeEvent;
import com.mjzsoft.launchpad.odata.event.OnUserLogoutSuccessEvent;
import com.mjzsoft.launchpad.odata.exception.UpdatePasswordException;
import com.mjzsoft.launchpad.odata.model.jwt.CustomUserDetails;
import com.mjzsoft.launchpad.odata.model.payload.ApiResponse;
import com.mjzsoft.launchpad.odata.model.payload.LogOutRequest;
import com.mjzsoft.launchpad.odata.model.payload.UpdatePasswordRequest;
import com.mjzsoft.launchpad.odata.model.payload.UserResponse;
import com.mjzsoft.launchpad.odata.service.jwt.AuthService;
import com.mjzsoft.launchpad.odata.service.jwt.UserService;
import com.mjzsoft.launchpad.odata.utils.ODataContextUtil;
import org.springframework.context.i18n.LocaleContextHolder;
import springfox.documentation.annotations.ApiIgnore;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.Authorization;
import io.swagger.annotations.ApiParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.Locale;

@RestController
@RequestMapping("/api/user")
@Api(value = "User Rest API", description = "Defines endpoints for the logged in user. It's secured by default")

public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final AuthService authService;

    private final UserService userService;

    private final ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    public UserController(AuthService authService, UserService userService, ApplicationEventPublisher applicationEventPublisher) {
        this.authService = authService;
        this.userService = userService;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    /**
     * Gets the current user profile of the logged in user
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    @ApiOperation(value = "Returns the current user profile", authorizations = { @Authorization(value="jwtToken") })
    public ResponseEntity<UserResponse> getUserProfile(@ApiIgnore @CurrentUser CustomUserDetails currentUser) {
        logger.info(currentUser.getEmail() + " has role: " + currentUser.getRoles());
        return ResponseEntity.ok(new UserResponse(currentUser));
    }

    /**
     * Returns all admins in the system. Requires Admin access
     */
    @GetMapping("/admins")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiOperation(value = "Returns the list of configured admins. Requires ADMIN Access", authorizations = { @Authorization(value="jwtToken") })
    public ResponseEntity<String> getAllAdmins() {
        logger.info("Inside secured resource with admin");
        Locale locale = LocaleContextHolder.getLocale();
        String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ResponseAboutAdmins");
        return ResponseEntity.ok(pattern);
    }

    /**
     * Updates the password of the current logged in user
     */
    @PostMapping("/password/update")
    @PreAuthorize("hasRole('USER')")
    @ApiOperation(value = "Allows the user to change his password once logged in by supplying the correct current " +
            "password", authorizations = { @Authorization(value="jwtToken") })
    public ResponseEntity<ApiResponse> updateUserPassword(@ApiIgnore @CurrentUser CustomUserDetails customUserDetails,
                                             @ApiParam(value = "The UpdatePasswordRequest payload") @Valid @RequestBody UpdatePasswordRequest updatePasswordRequest) {

        return authService.updatePassword(customUserDetails, updatePasswordRequest)
                .map(updatedUser -> {
                    OnUserAccountChangeEvent onUserPasswordChangeEvent = new OnUserAccountChangeEvent(updatedUser, "Update Password", "Change successful");
                    applicationEventPublisher.publishEvent(onUserPasswordChangeEvent);
                    Locale locale = LocaleContextHolder.getLocale();
                    String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("SuccessPasswordChange");
                    return ResponseEntity.ok(new ApiResponse(true, pattern));
                })
                .orElseThrow(() -> {
                    Locale locale = LocaleContextHolder.getLocale();
                    String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ErrorNoUser");
                    return new UpdatePasswordException("--Empty--", pattern);
                });
    }

    /**
     * Log the user out from the app/device. Release the refresh token associated with the
     * user device.
     */
    @PostMapping("/logout")
    @ApiOperation(value = "Logs the specified user device and clears the refresh tokens associated with it", authorizations = { @Authorization(value="jwtToken") })
    public ResponseEntity<ApiResponse> logoutUser(@ApiIgnore @CurrentUser CustomUserDetails customUserDetails,
                                     @ApiParam(value = "The LogOutRequest payload") @Valid @RequestBody LogOutRequest logOutRequest) {
        userService.logoutUser(customUserDetails, logOutRequest);
        Object credentials = SecurityContextHolder.getContext().getAuthentication().getCredentials();

        OnUserLogoutSuccessEvent logoutSuccessEvent = new OnUserLogoutSuccessEvent(customUserDetails.getEmail(), credentials.toString(), logOutRequest);
        applicationEventPublisher.publishEvent(logoutSuccessEvent);
        Locale locale = LocaleContextHolder.getLocale();
        String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("SuccessLogOut");
        return ResponseEntity.ok(new ApiResponse(true, pattern));
    }
}
