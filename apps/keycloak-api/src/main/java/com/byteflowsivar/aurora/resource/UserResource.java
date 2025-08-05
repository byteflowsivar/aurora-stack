package com.byteflowsivar.aurora.resource;

import com.byteflowsivar.aurora.domain.User;
import com.byteflowsivar.aurora.dto.CreateUserResponse;
import com.byteflowsivar.aurora.dto.ErrorResponse;
import com.byteflowsivar.aurora.dto.UserExistsResponse;
import com.byteflowsivar.aurora.exception.KeycloakServiceException;
import com.byteflowsivar.aurora.service.AuditService;
import com.byteflowsivar.aurora.service.KeycloakUserService;
import io.smallrye.faulttolerance.api.RateLimit;
import io.smallrye.faulttolerance.api.RateLimitException;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.time.temporal.ChronoUnit;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "User Management", description = "Operaciones de gestión de usuarios en Keycloak")
public class UserResource {

    @Inject
    KeycloakUserService keycloakUserService;
    
    @Inject
    AuditService auditService;

    @POST
    @RateLimit(value = 100, window = 1, windowUnit = ChronoUnit.MINUTES)
    @Operation(
        summary = "Crear nuevo usuario",
        description = "Crea un nuevo usuario no administrador en el realm de Keycloak"
    )
    @APIResponses({
        @APIResponse(
            responseCode = "201",
            description = "Usuario creado exitosamente",
            content = @Content(schema = @Schema(implementation = CreateUserResponse.class))
        ),
        @APIResponse(
            responseCode = "400",
            description = "Datos de validación incorrectos",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @APIResponse(
            responseCode = "429",
            description = "Límite de velocidad excedido",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @APIResponse(
            responseCode = "409",
            description = "El usuario ya existe",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @APIResponse(
            responseCode = "500",
            description = "Error interno del servidor",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    public Response createUser(
        @Context HttpHeaders headers,
        @Context UriInfo uriInfo,
        @Schema(
            description = "Datos del usuario a crear",
            required = true,
            example = """
                {
                  "username": "usuario123",
                  "email": "usuario@example.com",
                  "firstName": "Juan",
                  "lastName": "Pérez",
                  "password": "password123",
                  "enabled": true
                }
                """
        )
        User user) {
        String clientInfo = getClientInfo(headers);
        
        try {
            auditService.logUserCreationAttempt(user.getUsername(), user.getEmail(), clientInfo);
            
            if (keycloakUserService.userExists(user.getUsername())) {
                auditService.logUserCreationFailure("El usuario ya existe", clientInfo);
                return Response.status(Response.Status.CONFLICT)
                        .entity(new ErrorResponse("El usuario ya existe", "USER_ALREADY_EXISTS"))
                        .build();
            }

            String userId = keycloakUserService.createUser(user);
            auditService.logUserCreationSuccess(userId, clientInfo);
            
            return Response.status(Response.Status.CREATED)
                    .entity(new CreateUserResponse(userId, user.getUsername(), "Usuario creado exitosamente"))
                    .build();
                    
        } catch (RateLimitException e) {
            auditService.logRateLimitExceeded(clientInfo);
            return Response.status(429)
                    .entity(new ErrorResponse("Límite de velocidad excedido. Máximo 100 solicitudes por minuto", "RATE_LIMIT_EXCEEDED"))
                    .build();
        } catch (IllegalArgumentException e) {
            auditService.logValidationError(e.getMessage(), clientInfo);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage(), "VALIDATION_ERROR"))
                    .build();
        } catch (KeycloakServiceException e) {
            auditService.logUserCreationFailure(e.getErrorCode() + ": " + e.getMessage(), clientInfo);
            return Response.status(e.getHttpStatus())
                    .entity(new ErrorResponse(e.getMessage(), e.getErrorCode()))
                    .build();
        } catch (Exception e) {
            auditService.logUserCreationFailure("INTERNAL_ERROR: " + e.getMessage(), clientInfo);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Error interno del servidor", "INTERNAL_ERROR"))
                    .build();
        }
    }

    @GET
    @Path("/{username}/exists")
    @Operation(
        summary = "Verificar existencia de usuario",
        description = "Verifica si un usuario existe en el realm de Keycloak"
    )
    @APIResponses({
        @APIResponse(
            responseCode = "200",
            description = "Verificación completada",
            content = @Content(schema = @Schema(implementation = UserExistsResponse.class))
        ),
        @APIResponse(
            responseCode = "500",
            description = "Error interno del servidor",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    public Response checkUserExists(
        @Context HttpHeaders headers,
        @Context UriInfo uriInfo,
        @Parameter(
            description = "Nombre de usuario a verificar",
            required = true,
            example = "usuario123"
        )
        @PathParam("username") String username) {
        String clientInfo = getClientInfo(headers);
        
        try {
            auditService.logUserExistenceCheck(clientInfo);
            boolean exists = keycloakUserService.userExists(username);
            return Response.ok(new UserExistsResponse(username, exists)).build();
        } catch (KeycloakServiceException e) {
            auditService.logAuthenticationFailure(clientInfo);
            return Response.status(e.getHttpStatus())
                    .entity(new ErrorResponse(e.getMessage(), e.getErrorCode()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Error al verificar existencia del usuario", "INTERNAL_ERROR"))
                    .build();
        }
    }
    
    private String getClientInfo(HttpHeaders headers) {
        String clientIp = getClientIpAddress(headers);
        String userAgent = headers.getHeaderString("User-Agent");
        
        return String.format("IP=%s UA=%s", 
                           clientIp != null ? clientIp : "unknown",
                           userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 100)) : "unknown");
    }
    
    private String getClientIpAddress(HttpHeaders headers) {
        // Check for X-Forwarded-For header (common in load balancers/proxies)
        String xForwardedFor = headers.getHeaderString("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take the first IP in the chain
            return xForwardedFor.split(",")[0].trim();
        }
        
        // Check for X-Real-IP header (common in nginx)
        String xRealIp = headers.getHeaderString("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        // In test environment or when headers are not available
        return "test-client";
    }
}