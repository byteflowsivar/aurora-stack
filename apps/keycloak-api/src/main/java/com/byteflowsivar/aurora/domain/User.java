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
        // Apply sanitization during construction
        this.username = sanitizeInput(username);
        this.email = sanitizeInput(email);
        this.firstName = sanitizeInput(firstName);
        this.lastName = sanitizeInput(lastName);
        this.password = password; // Password is not sanitized to preserve special characters
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

    public String getPasswordForAuthentication() {
        return password;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void validate() {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de usuario es requerido");
        }
        
        String sanitizedUsername = sanitizeInput(username);
        if (sanitizedUsername.length() < 3 || sanitizedUsername.length() > 50) {
            throw new IllegalArgumentException("El nombre de usuario debe tener entre 3 y 50 caracteres");
        }
        if (!isValidUsername(sanitizedUsername)) {
            throw new IllegalArgumentException("El nombre de usuario contiene caracteres inválidos. Solo se permiten alfanuméricos, guión bajo, guión y punto");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("El correo electrónico es requerido");
        }
        
        String sanitizedEmail = sanitizeInput(email);
        if (!isValidEmail(sanitizedEmail)) {
            throw new IllegalArgumentException("Formato de correo electrónico inválido");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es requerida");
        }
        validatePasswordComplexity(password);
        if (firstName != null) {
            String sanitizedFirstName = sanitizeInput(firstName);
            if (sanitizedFirstName.length() > 50) {
                throw new IllegalArgumentException("El nombre no puede exceder 50 caracteres");
            }
            if (!isValidName(sanitizedFirstName)) {
                throw new IllegalArgumentException("El nombre contiene caracteres inválidos");
            }
        }
        if (lastName != null) {
            String sanitizedLastName = sanitizeInput(lastName);
            if (sanitizedLastName.length() > 50) {
                throw new IllegalArgumentException("El apellido no puede exceder 50 caracteres");
            }
            if (!isValidName(sanitizedLastName)) {
                throw new IllegalArgumentException("El apellido contiene caracteres inválidos");
            }
        }
    }

    private boolean isValidEmail(String email) {
        if (email == null) return false;
        
        // RFC 5322 compliant email regex (simplified but robust)
        String emailRegex = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
        return email.matches(emailRegex) && email.length() <= 254; // RFC 5321 limit
    }

    private void validatePasswordComplexity(String password) {
        if (password.length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres");
        }
        if (password.length() > 128) {
            throw new IllegalArgumentException("La contraseña no puede exceder 128 caracteres");
        }
        
        boolean hasUppercase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowercase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecialChar = password.chars().anyMatch(ch -> "!@#$%^&*()_+-=[]{}|;:,.<>?".indexOf(ch) >= 0);
        
        if (!hasUppercase) {
            throw new IllegalArgumentException("La contraseña debe contener al menos una letra mayúscula");
        }
        if (!hasLowercase) {
            throw new IllegalArgumentException("La contraseña debe contener al menos una letra minúscula");
        }
        if (!hasDigit) {
            throw new IllegalArgumentException("La contraseña debe contener al menos un dígito");
        }
        if (!hasSpecialChar) {
            throw new IllegalArgumentException("La contraseña debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)");
        }
        
        // Check for common weak patterns
        String lowerPassword = password.toLowerCase();
        if (lowerPassword.contains("password") || lowerPassword.contains("123456") || 
            lowerPassword.contains("qwerty") || lowerPassword.contains("admin") ||
            lowerPassword.contains("contraseña") || lowerPassword.contains("clave")) {
            throw new IllegalArgumentException("La contraseña contiene patrones débiles comunes");
        }
    }
    
    private String sanitizeInput(String input) {
        if (input == null) return null;
        
        // Remove leading and trailing whitespace
        String sanitized = input.trim();
        
        // Remove null bytes and control characters (except newline and tab for names)
        sanitized = sanitized.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", "");
        
        // Remove potentially dangerous HTML/XML characters
        sanitized = sanitized.replace("<", "").replace(">", "").replace("&", "");
        
        // Remove SQL injection attempts
        sanitized = sanitized.replaceAll("(?i)(select|insert|update|delete|drop|create|alter|exec|union|script)", "");
        
        return sanitized;
    }
    
    private boolean isValidUsername(String username) {
        if (username == null || username.isEmpty()) return false;
        
        // Username can only contain alphanumeric characters, underscore, hyphen, and dot
        // Must start with alphanumeric character
        return username.matches("^[a-zA-Z0-9][a-zA-Z0-9._-]*$") && 
               !username.contains("..") && // No consecutive dots
               !username.startsWith(".") && !username.endsWith("."); // No leading/trailing dots
    }
    
    private boolean isValidName(String name) {
        if (name == null || name.isEmpty()) return true; // Names are optional
        
        // Names can contain letters, spaces, hyphens, apostrophes, and dots
        // Common in international names
        return name.matches("^[a-zA-Z\\u00C0-\\u017F\\s'.-]+$") && 
               name.length() >= 1 && 
               !name.matches(".*[.'-]{2,}.*"); // No consecutive special characters
    }
}