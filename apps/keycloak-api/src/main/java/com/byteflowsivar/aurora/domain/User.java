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
        if (username.length() < 3 || username.length() > 50) {
            throw new IllegalArgumentException("Username must be between 3 and 50 characters");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        if (firstName != null && firstName.length() > 50) {
            throw new IllegalArgumentException("First name cannot exceed 50 characters");
        }
        if (lastName != null && lastName.length() > 50) {
            throw new IllegalArgumentException("Last name cannot exceed 50 characters");
        }
    }

    private boolean isValidEmail(String email) {
        if (email == null) return false;
        
        // RFC 5322 compliant email regex (simplified but robust)
        String emailRegex = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
        return email.matches(emailRegex) && email.length() <= 254; // RFC 5321 limit
    }
}