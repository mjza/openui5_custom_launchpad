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

import com.mjzsoft.launchpad.odata.exception.TokenRefreshException;
import com.mjzsoft.launchpad.odata.model.jwt.UserDevice;
import com.mjzsoft.launchpad.odata.model.payload.DeviceInfo;
import com.mjzsoft.launchpad.odata.model.token.RefreshToken;
import com.mjzsoft.launchpad.odata.repository.jwt.UserDeviceRepository;
import com.mjzsoft.launchpad.odata.utils.ODataContextUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Optional;

@Service
public class UserDeviceService {

    private final UserDeviceRepository userDeviceRepository;

    @Autowired
    public UserDeviceService(UserDeviceRepository userDeviceRepository) {
        this.userDeviceRepository = userDeviceRepository;
    }

    /**
     * Find the user device info by user id
     */
    public Optional<UserDevice> findByUserId(Long userId) {
        return userDeviceRepository.findByUserId(userId);
    }

    /**
     * Find the user device info by refresh token
     */
    public Optional<UserDevice> findByRefreshToken(RefreshToken refreshToken) {
        return userDeviceRepository.findByRefreshToken(refreshToken);
    }

    /**
     * Creates a new user device and set the user to the current device
     */
    public UserDevice createUserDevice(DeviceInfo deviceInfo) {
        UserDevice userDevice = new UserDevice();
        userDevice.setDeviceId(deviceInfo.getDeviceId());
        userDevice.setDeviceType(deviceInfo.getDeviceType());
        userDevice.setNotificationToken(deviceInfo.getNotificationToken());
        userDevice.setRefreshActive(true);
        return userDevice;
    }

    /**
     * Check whether the user device corresponding to the token has refresh enabled and
     * throw appropriate errors to the client
     */
    void verifyRefreshAvailability(RefreshToken refreshToken) {
        UserDevice userDevice = findByRefreshToken(refreshToken)
                .orElseThrow(() -> {
                    Locale locale = LocaleContextHolder.getLocale();
                    String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ErrorNoDevice");
                    return new TokenRefreshException(refreshToken.getToken(), pattern);
                });

        if (!userDevice.getRefreshActive()) {
            Locale locale = LocaleContextHolder.getLocale();
            String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ErrorDeviceBlocked");
            throw new TokenRefreshException(refreshToken.getToken(), pattern);
        }
    }
}
