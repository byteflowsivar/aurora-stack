package com.byteflowsivar.aurora.health;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;
import org.jboss.logging.Logger;
import org.keycloak.admin.client.Keycloak;

@Readiness
@ApplicationScoped
public class KeycloakHealthCheck implements HealthCheck {

    private static final Logger LOG = Logger.getLogger(KeycloakHealthCheck.class);

    @Inject
    Keycloak keycloak;

    @ConfigProperty(name = "keycloak.target-realm")
    String targetRealm;

    @ConfigProperty(name = "quarkus.keycloak.admin-client.server-url")
    String serverUrl;

    @Override
    public HealthCheckResponse call() {
        try {
            // Attempt to access the target realm to verify connectivity
            var realmResource = keycloak.realm(targetRealm);
            var realmRepresentation = realmResource.toRepresentation();
            
            if (realmRepresentation != null && targetRealm.equals(realmRepresentation.getRealm())) {
                LOG.debugf("Keycloak health check passed for realm: %s", targetRealm);
                return HealthCheckResponse.builder()
                    .name("keycloak")
                    .up()
                    .withData("realm", targetRealm)
                    .withData("server-url", serverUrl)
                    .withData("status", "connected")
                    .build();
            } else {
                LOG.warnf("Keycloak realm mismatch. Expected: %s, Got: %s", 
                    targetRealm, realmRepresentation != null ? realmRepresentation.getRealm() : "null");
                return HealthCheckResponse.builder()
                    .name("keycloak")
                    .down()
                    .withData("realm", targetRealm)
                    .withData("server-url", serverUrl)
                    .withData("error", "Realm mismatch")
                    .build();
            }
        } catch (Exception e) {
            LOG.errorf(e, "Keycloak health check failed for realm: %s", targetRealm);
            return HealthCheckResponse.builder()
                .name("keycloak")
                .down()
                .withData("realm", targetRealm)
                .withData("server-url", serverUrl)
                .withData("error", e.getMessage())
                .build();
        }
    }
}