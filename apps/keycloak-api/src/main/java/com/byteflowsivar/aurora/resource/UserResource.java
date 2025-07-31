package com.byteflowsivar.aurora.resource;

import com.byteflowsivar.aurora.domain.User;
import com.byteflowsivar.aurora.service.KeycloakUserService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
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

    @POST
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
        try {
            if (keycloakUserService.userExists(user.getUsername())) {
                return Response.status(Response.Status.CONFLICT)
                        .entity(new ErrorResponse("User already exists with username: " + user.getUsername()))
                        .build();
            }

            String userId = keycloakUserService.createUser(user);
            
            return Response.status(Response.Status.CREATED)
                    .entity(new CreateUserResponse(userId, user.getUsername(), "User created successfully"))
                    .build();
                    
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(e.getMessage()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Internal server error: " + e.getMessage()))
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
        @Parameter(
            description = "Nombre de usuario a verificar",
            required = true,
            example = "usuario123"
        )
        @PathParam("username") String username) {
        try {
            boolean exists = keycloakUserService.userExists(username);
            return Response.ok(new UserExistsResponse(username, exists)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorResponse("Error checking user existence: " + e.getMessage()))
                    .build();
        }
    }

    public static class CreateUserResponse {
        public final String userId;
        public final String username;
        public final String message;

        public CreateUserResponse(String userId, String username, String message) {
            this.userId = userId;
            this.username = username;
            this.message = message;
        }
    }

    public static class UserExistsResponse {
        public final String username;
        public final boolean exists;

        public UserExistsResponse(String username, boolean exists) {
            this.username = username;
            this.exists = exists;
        }
    }

    public static class ErrorResponse {
        public final String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}