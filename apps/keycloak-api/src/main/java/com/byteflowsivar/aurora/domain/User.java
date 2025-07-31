package com.byteflowsivar.aurora.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Schema(description = "Usuario para crear en Keycloak")
public class User {
    
    @Schema(description = "Nombre de usuario único", required = true, example = "usuario123")
    private final String username;
    
    @Schema(description = "Dirección de correo electrónico", required = true, example = "usuario@example.com")
    private final String email;
    
    @Schema(description = "Nombre del usuario", example = "Juan")
    private final String firstName;
    
    @Schema(description = "Apellido del usuario", example = "Pérez")
    private final String lastName;
    
    @Schema(description = "Contraseña del usuario", required = true, example = "password123")
    private final String password;
    
    @Schema(description = "Estado del usuario (activo/inactivo)", example = "true")
    private final boolean enabled;

    @JsonCreator
    public User(
            @JsonProperty("username") String username,
            @JsonProperty("email") String email,
            @JsonProperty("firstName") String firstName,
            @JsonProperty("lastName") String lastName,
            @JsonProperty("password") String password,
            @JsonProperty("enabled") Boolean enabled) {
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.enabled = enabled != null ? enabled : true;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPassword() {
        return password;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void validate() {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    private boolean isValidEmail(String email) {
        return email != null && email.contains("@") && email.contains(".");
    }
}