package com.byteflowsivar.aurora.service;

import com.byteflowsivar.aurora.domain.User;
import com.byteflowsivar.aurora.exception.KeycloakServiceException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;

import jakarta.ws.rs.core.Response;
import java.util.List;

@ApplicationScoped
public class KeycloakUserService {

    private static final Logger LOG = Logger.getLogger(KeycloakUserService.class);

    @Inject
    Keycloak keycloak;

    @ConfigProperty(name = "keycloak.target-realm")
    String targetRealm;

    public String createUser(User user) {
        LOG.infof("Creating user: %s in realm: %s", user.getUsername(), targetRealm);
        
        try {
            user.validate();
            
            RealmResource realmResource = getRealmResource();
            UsersResource usersResource = realmResource.users();

            UserRepresentation userRepresentation = buildUserRepresentation(user);

            try (Response response = usersResource.create(userRepresentation)) {
                int status = response.getStatus();
                LOG.infof("User creation response status: %d for user: %s", status, user.getUsername());
                
                if (status == 201) {
                    String userId = extractUserIdFromLocation(response.getLocation().toString());
                    LOG.infof("User created successfully with ID: %s", userId);
                    
                    setUserPassword(usersResource, userId, user.getPassword());
                    LOG.infof("Password set successfully for user: %s", user.getUsername());
                    
                    return userId;
                } else if (status == 409) {
                    LOG.warnf("User already exists: %s", user.getUsername());
                    throw new KeycloakServiceException(
                        "User already exists with username: " + user.getUsername(),
                        "USER_ALREADY_EXISTS", 
                        409
                    );
                } else {
                    String errorMsg = "Failed to create user. HTTP Status: " + status;
                    LOG.errorf(errorMsg + " for user: %s", user.getUsername());
                    throw new KeycloakServiceException(errorMsg, "USER_CREATION_FAILED", status);
                }
            }
        } catch (IllegalArgumentException e) {
            LOG.warnf("Validation error for user %s: %s", user.getUsername(), e.getMessage());
            throw e; // Re-throw validation errors as-is
        } catch (KeycloakServiceException e) {
            throw e; // Re-throw our custom exceptions
        } catch (Exception e) {
            LOG.errorf(e, "Unexpected error creating user: %s", user.getUsername());
            throw new KeycloakServiceException(
                "Unexpected error during user creation: " + e.getMessage(),
                "INTERNAL_ERROR",
                500,
                e
            );
        }
    }

    private UserRepresentation buildUserRepresentation(User user) {
        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setUsername(user.getUsername());
        userRepresentation.setEmail(user.getEmail());
        userRepresentation.setFirstName(user.getFirstName());
        userRepresentation.setLastName(user.getLastName());
        userRepresentation.setEnabled(user.isEnabled());
        userRepresentation.setEmailVerified(false);
        return userRepresentation;
    }

    private void setUserPassword(UsersResource usersResource, String userId, String password) {
        try {
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(password);
            credential.setTemporary(false);

            usersResource.get(userId).resetPassword(credential);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to set password for user ID: %s", userId);
            throw new KeycloakServiceException(
                "Failed to set user password",
                "PASSWORD_SET_FAILED",
                500,
                e
            );
        }
    }

    private String extractUserIdFromLocation(String location) {
        if (location == null || location.isEmpty()) {
            throw new KeycloakServiceException(
                "Invalid location header from Keycloak",
                "INVALID_LOCATION_HEADER",
                500
            );
        }
        try {
            String[] parts = location.split("/");
            String userId = parts[parts.length - 1];
            if (userId.isEmpty()) {
                throw new KeycloakServiceException(
                    "Could not extract user ID from location: " + location,
                    "USER_ID_EXTRACTION_FAILED",
                    500
                );
            }
            return userId;
        } catch (Exception e) {
            LOG.errorf(e, "Error extracting user ID from location: %s", location);
            throw new KeycloakServiceException(
                "Failed to extract user ID from location",
                "USER_ID_EXTRACTION_FAILED",
                500,
                e
            );
        }
    }

    public boolean userExists(String username) {
        LOG.infof("Checking if user exists: %s in realm: %s", username, targetRealm);
        
        try {
            RealmResource realmResource = getRealmResource();
            UsersResource usersResource = realmResource.users();
            
            List<UserRepresentation> users = usersResource.search(username, true);
            boolean exists = !users.isEmpty();
            
            LOG.infof("User existence check result for %s: %s", username, exists);
            return exists;
        } catch (Exception e) {
            LOG.errorf(e, "Error checking user existence for: %s", username);
            throw new KeycloakServiceException(
                "Failed to check user existence",
                "USER_EXISTENCE_CHECK_FAILED",
                500,
                e
            );
        }
    }

    private RealmResource getRealmResource() {
        try {
            return keycloak.realm(targetRealm);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to access realm: %s", targetRealm);
            throw new KeycloakServiceException(
                "Failed to access Keycloak realm: " + targetRealm,
                "REALM_ACCESS_FAILED",
                503,
                e
            );
        }
    }
}