package com.byteflowsivar.aurora.dto;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "Respuesta exitosa de creación de usuario")
public class CreateUserResponse {
    
    @Schema(description = "ID único del usuario en Keycloak", example = "f47ac10b-58cc-4372-a567-0e02b2c3d479")
    public final String userId;
    
    @Schema(description = "Nombre de usuario", example = "usuario123")
    public final String username;
    
    @Schema(description = "Mensaje de confirmación", example = "User created successfully")
    public final String message;

    public CreateUserResponse(String userId, String username, String message) {
        this.userId = userId;
        this.username = username;
        this.message = message;
    }
}