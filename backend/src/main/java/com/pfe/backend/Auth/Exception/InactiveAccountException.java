package com.pfe.backend.Auth.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class InactiveAccountException extends ResponseStatusException {
    public InactiveAccountException() {
        super(HttpStatus.UNAUTHORIZED, "INACTIVE");
    }
}