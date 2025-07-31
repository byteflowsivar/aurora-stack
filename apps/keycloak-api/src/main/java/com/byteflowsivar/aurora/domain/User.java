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
            throw new IllegalArgumentException("Username is required");
        }
        
        String sanitizedUsername = sanitizeInput(username);
        if (sanitizedUsername.length() < 3 || sanitizedUsername.length() > 50) {
            throw new IllegalArgumentException("Username must be between 3 and 50 characters");
        }
        if (!isValidUsername(sanitizedUsername)) {
            throw new IllegalArgumentException("Username contains invalid characters. Only alphanumeric, underscore, hyphen and dot are allowed");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        
        String sanitizedEmail = sanitizeInput(email);
        if (!isValidEmail(sanitizedEmail)) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        validatePasswordComplexity(password);
        if (firstName != null) {
            String sanitizedFirstName = sanitizeInput(firstName);
            if (sanitizedFirstName.length() > 50) {
                throw new IllegalArgumentException("First name cannot exceed 50 characters");
            }
            if (!isValidName(sanitizedFirstName)) {
                throw new IllegalArgumentException("First name contains invalid characters");
            }
        }
        if (lastName != null) {
            String sanitizedLastName = sanitizeInput(lastName);
            if (sanitizedLastName.length() > 50) {
                throw new IllegalArgumentException("Last name cannot exceed 50 characters");
            }
            if (!isValidName(sanitizedLastName)) {
                throw new IllegalArgumentException("Last name contains invalid characters");
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
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        if (password.length() > 128) {
            throw new IllegalArgumentException("Password cannot exceed 128 characters");
        }
        
        boolean hasUppercase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowercase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecialChar = password.chars().anyMatch(ch -> "!@#$%^&*()_+-=[]{}|;:,.<>?".indexOf(ch) >= 0);
        
        if (!hasUppercase) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }
        if (!hasLowercase) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }
        if (!hasDigit) {
            throw new IllegalArgumentException("Password must contain at least one digit");
        }
        if (!hasSpecialChar) {
            throw new IllegalArgumentException("Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)");
        }
        
        // Check for common weak patterns
        String lowerPassword = password.toLowerCase();
        if (lowerPassword.contains("password") || lowerPassword.contains("123456") || 
            lowerPassword.contains("qwerty") || lowerPassword.contains("admin")) {
            throw new IllegalArgumentException("Password contains common weak patterns");
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