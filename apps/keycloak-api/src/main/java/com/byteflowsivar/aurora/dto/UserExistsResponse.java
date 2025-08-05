package com.byteflowsivar.aurora.dto;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "Respuesta de verificación de existencia de usuario")
public class UserExistsResponse {
    
    @Schema(description = "Nombre de usuario consultado", example = "usuario123")
    public final String username;
    
    @Schema(description = "Indica si el usuario existe", example = "true")
    public final boolean exists;

    public UserExistsResponse(String username, boolean exists) {
        this.username = username;
        this.exists = exists;
    }
}