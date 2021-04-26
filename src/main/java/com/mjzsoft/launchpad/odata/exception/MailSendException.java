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
package com.mjzsoft.launchpad.odata.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class MailSendException extends RuntimeException {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private final String recipientAddress;
    private final String message;

    public MailSendException(String recipientAddress, String message) {
        super(String.format("Error sending [%s] for user [%s]", message, recipientAddress));
        this.recipientAddress = recipientAddress;
        this.message = message;
    }
    
    public String getMessage() {
    	return this.message;
    }
    
    public String getRecipientAddress() {
    	return this.recipientAddress;
    }
}