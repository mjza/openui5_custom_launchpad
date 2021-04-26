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

import com.mjzsoft.launchpad.odata.exception.InvalidTokenRequestException;
import com.mjzsoft.launchpad.odata.model.jwt.PasswordResetToken;
import com.mjzsoft.launchpad.odata.repository.jwt.PasswordResetTokenRepository;
import com.mjzsoft.launchpad.odata.utils.ODataContextUtil;
import com.mjzsoft.launchpad.odata.utils.jwt.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Locale;
import java.util.Optional;

@Service
public class PasswordResetTokenService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${app.token.password.reset.duration}")
    private Long expiration;

    @Autowired
    public PasswordResetTokenService(PasswordResetTokenRepository passwordResetTokenRepository) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    /**
     * Saves the given password reset token
     */
    public PasswordResetToken save(PasswordResetToken passwordResetToken) {
        return passwordResetTokenRepository.save(passwordResetToken);
    }

    /**
     * Finds a token in the database given its naturalId
     */
    public Optional<PasswordResetToken> findByToken(String token) {
        return passwordResetTokenRepository.findByToken(token);
    }

    /**
     * Creates and returns a new password token to which a user must be associated
     */
    public PasswordResetToken createToken() {
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        String token = Util.generateRandomUuid();
        passwordResetToken.setToken(token);
        passwordResetToken.setExpiryDate(Date.from(Instant.now().plusMillis(expiration)));
        return passwordResetToken;
    }

    /**
     * Verify whether the token provided has expired or not on the basis of the current
     * server time and/or throw error otherwise
     */
    public void verifyExpiration(PasswordResetToken token) {
        if (token.getExpiryDate().toInstant().compareTo(Instant.now()) < 0) {
            Locale locale = LocaleContextHolder.getLocale();
            String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ErrorTokenExpired");
            throw new InvalidTokenRequestException("Password Reset Token", token.getToken(), pattern);
        }
    }
}
