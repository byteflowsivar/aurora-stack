package com.byteflowsivar.aurora.dto;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "Respuesta de error de la API")
public class ErrorResponse {
    
    @Schema(description = "Mensaje de error detallado", example = "Username is required")
    public final String error;
    
    @Schema(description = "Código de error interno (opcional)", example = "VALIDATION_ERROR")
    public final String errorCode;
    
    @Schema(description = "Timestamp del error", example = "2024-01-15T10:30:00Z")
    public final String timestamp;

    public ErrorResponse(String error) {
        this.error = error;
        this.errorCode = null;
        this.timestamp = java.time.Instant.now().toString();
    }

    public ErrorResponse(String error, String errorCode) {
        this.error = error;
        this.errorCode = errorCode;
        this.timestamp = java.time.Instant.now().toString();
    }
}