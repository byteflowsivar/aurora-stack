package com.byteflowsivar.aurora.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.Map;

@ApplicationScoped
public class AuditService {

    private static final Logger AUDIT_LOG = Logger.getLogger("AUDIT");

    public void logUserCreationAttempt(String username, String email, String clientInfo) {
        logSecurityEvent("USER_CREATION_ATTEMPT", Map.of(
            "username", sanitizeForLog(username),
            "email", sanitizeForLog(email),
            "client_info", sanitizeForLog(clientInfo)
        ));
    }

    public void logUserCreationSuccess(String userId, String clientInfo) {
        logSecurityEvent("USER_CREATION_SUCCESS", Map.of(
            "user_id", sanitizeForLog(userId),
            "client_info", sanitizeForLog(clientInfo)
        ));
    }

    public void logUserCreationFailure(String reason, String clientInfo) {
        logSecurityEvent("USER_CREATION_FAILURE", Map.of(
            "reason", sanitizeForLog(reason),
            "client_info", sanitizeForLog(clientInfo)
        ));
    }

    public void logUserExistenceCheck(String clientInfo) {
        logSecurityEvent("USER_EXISTENCE_CHECK", Map.of(
            "client_info", sanitizeForLog(clientInfo)
        ));
    }

    public void logRateLimitExceeded(String clientInfo) {
        logSecurityEvent("RATE_LIMIT_EXCEEDED", Map.of(
            "client_info", sanitizeForLog(clientInfo)
        ));
    }

    public void logValidationError(String errorType, String clientInfo) {
        logSecurityEvent("VALIDATION_ERROR", Map.of(
            "error_type", sanitizeForLog(errorType),
            "client_info", sanitizeForLog(clientInfo)
        ));
    }

    public void logAuthenticationFailure(String clientInfo) {
        logSecurityEvent("AUTHENTICATION_FAILURE", Map.of(
            "client_info", sanitizeForLog(clientInfo)
        ));
    }

    public void logSuspiciousActivity(String activityType, String details, String clientInfo) {
        logSecurityEvent("SUSPICIOUS_ACTIVITY", Map.of(
            "activity_type", sanitizeForLog(activityType),
            "details", sanitizeForLog(details),
            "client_info", sanitizeForLog(clientInfo)
        ));
    }

    private void logSecurityEvent(String eventType, Map<String, String> details) {
        StringBuilder logMessage = new StringBuilder();
        logMessage.append("SECURITY_EVENT=").append(eventType);
        logMessage.append(" TIMESTAMP=").append(Instant.now().toString());
        
        details.forEach((key, value) -> 
            logMessage.append(" ").append(key.toUpperCase()).append("=").append(value)
        );
        
        AUDIT_LOG.infof(logMessage.toString());
    }

    private String sanitizeForLog(String input) {
        if (input == null) {
            return "null";
        }
        
        // Remove line breaks and control characters that could break log parsing
        String sanitized = input.replaceAll("[\\r\\n\\t]", "_")
                               .replaceAll("[\\x00-\\x1F\\x7F]", "");
        
        // Truncate very long strings to prevent log flooding
        if (sanitized.length() > 200) {
            sanitized = sanitized.substring(0, 197) + "...";
        }
        
        // Quote strings that contain spaces or special characters for easier parsing
        if (sanitized.contains(" ") || sanitized.contains("=") || sanitized.contains("\"")) {
            sanitized = "\"" + sanitized.replace("\"", "\\\"") + "\"";
        }
        
        return sanitized;
    }
}