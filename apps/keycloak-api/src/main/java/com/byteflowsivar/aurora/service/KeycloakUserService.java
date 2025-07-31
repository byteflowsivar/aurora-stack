package com.byteflowsivar.aurora.service;

import com.byteflowsivar.aurora.domain.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;

import jakarta.ws.rs.core.Response;
import java.util.List;

@ApplicationScoped
public class KeycloakUserService {

    @Inject
    Keycloak keycloak;

    @ConfigProperty(name = "keycloak.target-realm")
    String targetRealm;

    public String createUser(User user) {
        user.validate();
        
        RealmResource realmResource = keycloak.realm(targetRealm);
        UsersResource usersResource = realmResource.users();

        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setUsername(user.getUsername());
        userRepresentation.setEmail(user.getEmail());
        userRepresentation.setFirstName(user.getFirstName());
        userRepresentation.setLastName(user.getLastName());
        userRepresentation.setEnabled(user.isEnabled());
        userRepresentation.setEmailVerified(false);

        try (Response response = usersResource.create(userRepresentation)) {
            if (response.getStatus() == 201) {
                String userId = extractUserIdFromLocation(response.getLocation().toString());
                setUserPassword(usersResource, userId, user.getPassword());
                return userId;
            } else {
                throw new RuntimeException("Failed to create user. Status: " + response.getStatus());
            }
        }
    }

    private void setUserPassword(UsersResource usersResource, String userId, String password) {
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false);

        usersResource.get(userId).resetPassword(credential);
    }

    private String extractUserIdFromLocation(String location) {
        String[] parts = location.split("/");
        return parts[parts.length - 1];
    }

    public boolean userExists(String username) {
        RealmResource realmResource = keycloak.realm(targetRealm);
        UsersResource usersResource = realmResource.users();
        
        List<UserRepresentation> users = usersResource.search(username, true);
        return !users.isEmpty();
    }
}