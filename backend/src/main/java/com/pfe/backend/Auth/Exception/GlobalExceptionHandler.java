package com.pfe.backend.Auth.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InactiveAccountException.class)
    public ResponseEntity<Map<String, String>> handleInactiveAccountException(InactiveAccountException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Unauthorized");
        errorResponse.put("errorCode", "INACTIVE");
        errorResponse.put("message", "Votre compte est désactivé. Veuillez contacter votre administrateur ou votre superviseur.");
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(NoGroupException.class)
    public ResponseEntity<Map<String, String>> handleNoGroupException(NoGroupException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Unauthorized");
        errorResponse.put("errorCode", "NO_GROUP");
        errorResponse.put("message", "Utilisateur non autorisé");
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Unauthorized");
        errorResponse.put("errorCode", ex.getReason() != null ? ex.getReason() : "UNKNOWN");
        errorResponse.put("message", getMessageForErrorCode(ex.getReason()));
        return new ResponseEntity<>(errorResponse, ex.getStatusCode());
    }

    private String getMessageForErrorCode(String errorCode) {
        switch (errorCode) {
            case "INVALID_CREDENTIALS":
                return "Matricule ou mot de passe incorrect";
            case "USER_NOT_FOUND":
                return "Utilisateur non trouvé";
            case "GROUP_NOT_FOUND":
                return "Groupe non trouvé";
            default:
                return "Erreur inconnue";
        }
    }
}
