package com.byteflowsivar.aurora.exception;

public class KeycloakServiceException extends RuntimeException {
    
    private final String errorCode;
    private final int httpStatus;

    public KeycloakServiceException(String message) {
        super(message);
        this.errorCode = "KEYCLOAK_ERROR";
        this.httpStatus = 500;
    }

    public KeycloakServiceException(String message, String errorCode, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public KeycloakServiceException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "KEYCLOAK_ERROR";
        this.httpStatus = 500;
    }

    public KeycloakServiceException(String message, String errorCode, int httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}