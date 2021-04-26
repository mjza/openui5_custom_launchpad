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
package com.mjzsoft.launchpad.odata.security;

import com.mjzsoft.launchpad.odata.cache.LoggedOutJwtTokenCache;
import com.mjzsoft.launchpad.odata.event.OnUserLogoutSuccessEvent;
import com.mjzsoft.launchpad.odata.exception.InvalidTokenRequestException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import com.mjzsoft.launchpad.odata.utils.ODataContextUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.text.MessageFormat;
import java.util.Date;
import java.util.Locale;
import java.util.ResourceBundle;

@Component
public class JwtTokenValidator {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenValidator.class);
    private final String jwtSecret;
    private final LoggedOutJwtTokenCache loggedOutTokenCache;

    @Autowired
    public JwtTokenValidator(@Value("${app.jwt.secret}") String jwtSecret, LoggedOutJwtTokenCache loggedOutTokenCache) {
        this.jwtSecret = jwtSecret;
        this.loggedOutTokenCache = loggedOutTokenCache;
    }

    /**
     * Validates if a token satisfies the following properties
     * - Signature is not malformed
     * - Token hasn't expired
     * - Token is supported
     * - Token has not recently been logged out.
     */
    public boolean validateToken(String authToken) {
        Locale locale = LocaleContextHolder.getLocale();
        ResourceBundle i18n = ODataContextUtil.getResourceBundle("i18n", locale);
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);

        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature");
            throw new InvalidTokenRequestException("JWT", authToken, i18n.getString("ErrorValidationSignature"));

        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
            throw new InvalidTokenRequestException("JWT", authToken, i18n.getString("ErrorValidationMalformed"));

        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
            throw new InvalidTokenRequestException("JWT", authToken, i18n.getString("ErrorValidationExpired"));

        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
            throw new InvalidTokenRequestException("JWT", authToken, i18n.getString("ErrorValidationUnsupported"));

        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
            throw new InvalidTokenRequestException("JWT", authToken, i18n.getString("ErrorValidationIllegal"));
        }
        validateTokenIsNotForALoggedOutDevice(authToken);
        return true;
    }

    private void validateTokenIsNotForALoggedOutDevice(String authToken) {
        OnUserLogoutSuccessEvent previouslyLoggedOutEvent = loggedOutTokenCache.getLogoutEventForToken(authToken);
        if (previouslyLoggedOutEvent != null) {
            String userEmail = previouslyLoggedOutEvent.getUserEmail();
            Date logoutEventDate = previouslyLoggedOutEvent.getEventTime();
            Locale locale = LocaleContextHolder.getLocale();
            String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ErrorTokenLoggedOut");
            String message = MessageFormat.format(pattern, userEmail, logoutEventDate);
            throw new InvalidTokenRequestException("JWT", authToken, message);
        }
    }
}
