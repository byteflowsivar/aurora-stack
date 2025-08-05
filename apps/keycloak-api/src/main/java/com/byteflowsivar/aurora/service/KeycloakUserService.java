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
        LOG.infof("Creando usuario en realm: %s", targetRealm);
        
        try {
            user.validate();
            
            RealmResource realmResource = getRealmResource();
            UsersResource usersResource = realmResource.users();

            UserRepresentation userRepresentation = buildUserRepresentation(user);

            try (Response response = usersResource.create(userRepresentation)) {
                int status = response.getStatus();
                LOG.infof("Estado de respuesta de creación de usuario: %d", status);
                
                if (status == 201) {
                    String userId = extractUserIdFromLocation(response.getLocation().toString());
                    LOG.infof("Usuario creado exitosamente con ID: %s", userId);
                    
                    setUserPassword(usersResource, userId, user.getPasswordForAuthentication());
                    LOG.infof("Contraseña establecida exitosamente para usuario ID: %s", userId);
                    
                    return userId;
                } else if (status == 409) {
                    LOG.warnf("El usuario ya existe en realm: %s", targetRealm);
                    throw new KeycloakServiceException(
                        "El usuario ya existe",
                        "USER_ALREADY_EXISTS", 
                        409
                    );
                } else {
                    String errorMsg = "Error al crear usuario. Estado HTTP: " + status;
                    LOG.errorf(errorMsg + " en realm: %s", targetRealm);
                    throw new KeycloakServiceException(errorMsg, "USER_CREATION_FAILED", status);
                }
            }
        } catch (IllegalArgumentException e) {
            LOG.warnf("Error de validación: %s", e.getMessage());
            throw e; // Re-throw validation errors as-is
        } catch (KeycloakServiceException e) {
            throw e; // Re-throw our custom exceptions
        } catch (Exception e) {
            LOG.errorf(e, "Error inesperado creando usuario en realm: %s", targetRealm);
            throw new KeycloakServiceException(
                "Error inesperado durante la creación del usuario: " + e.getMessage(),
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
            LOG.errorf(e, "Error al establecer contraseña para usuario ID: %s", userId);
            throw new KeycloakServiceException(
                "Error al establecer la contraseña del usuario",
                "PASSWORD_SET_FAILED",
                500,
                e
            );
        }
    }

    private String extractUserIdFromLocation(String location) {
        if (location == null || location.isEmpty()) {
            throw new KeycloakServiceException(
                "Encabezado de ubicación inválido de Keycloak",
                "INVALID_LOCATION_HEADER",
                500
            );
        }
        try {
            String[] parts = location.split("/");
            String userId = parts[parts.length - 1];
            if (userId.isEmpty()) {
                throw new KeycloakServiceException(
                    "No se pudo extraer el ID del usuario de la ubicación: " + location,
                    "USER_ID_EXTRACTION_FAILED",
                    500
                );
            }
            return userId;
        } catch (Exception e) {
            LOG.errorf(e, "Error extrayendo ID de usuario de la ubicación: %s", location);
            throw new KeycloakServiceException(
                "Error al extraer el ID del usuario de la ubicación",
                "USER_ID_EXTRACTION_FAILED",
                500,
                e
            );
        }
    }

    public boolean userExists(String username) {
        LOG.infof("Verificando si el usuario existe en realm: %s", targetRealm);
        
        try {
            RealmResource realmResource = getRealmResource();
            UsersResource usersResource = realmResource.users();
            
            List<UserRepresentation> users = usersResource.search(username, true);
            boolean exists = !users.isEmpty();
            
            LOG.infof("Verificación de existencia de usuario completada: %s", exists);
            return exists;
        } catch (Exception e) {
            LOG.errorf(e, "Error verificando existencia de usuario en realm: %s", targetRealm);
            throw new KeycloakServiceException(
                "Error al verificar la existencia del usuario",
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
            LOG.errorf(e, "Error al acceder al realm: %s", targetRealm);
            throw new KeycloakServiceException(
                "Error al acceder al realm de Keycloak: " + targetRealm,
                "REALM_ACCESS_FAILED",
                503,
                e
            );
        }
    }
}