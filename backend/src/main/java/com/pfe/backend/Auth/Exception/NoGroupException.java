package com.pfe.backend.Auth.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class NoGroupException extends ResponseStatusException {
    public NoGroupException() {
        super(HttpStatus.UNAUTHORIZED, "NO_GROUP");
    }
}
