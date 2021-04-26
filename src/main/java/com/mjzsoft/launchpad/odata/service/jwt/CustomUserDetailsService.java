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

import com.mjzsoft.launchpad.odata.model.jwt.CustomUserDetails;
import com.mjzsoft.launchpad.odata.model.jwt.User;
import com.mjzsoft.launchpad.odata.repository.jwt.UserRepository;

import com.mjzsoft.launchpad.odata.utils.ODataContextUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
    private final UserRepository userRepository;

    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> dbUser = userRepository.findByEmail(email);
        logger.info("Fetched user : " + dbUser + " by " + email);
        return dbUser.map(CustomUserDetails::new)
                .orElseThrow(() -> {
                    Locale locale = LocaleContextHolder.getLocale();
                    String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ErrorNoEmailForUser");
                    String message = MessageFormat.format(pattern, email);
                    return new UsernameNotFoundException(message);
                });
    }

    public UserDetails loadUserById(Long id) {
        Optional<User> dbUser = userRepository.findById(id);
        logger.info("Fetched user : " + dbUser + " by " + id);
        return dbUser.map(CustomUserDetails::new)
                .orElseThrow(() -> {
                    Locale locale = LocaleContextHolder.getLocale();
                    String pattern = ODataContextUtil.getResourceBundle("i18n", locale).getString("ErrorNoIdForUser");
                    String message = MessageFormat.format(pattern, id);
                    return new UsernameNotFoundException(message);
                });
    }
}
