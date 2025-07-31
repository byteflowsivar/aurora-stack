package com.byteflowsivar.aurora.resource;

import com.byteflowsivar.aurora.domain.User;
import com.byteflowsivar.aurora.service.KeycloakUserService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    KeycloakUserService keycloakUserService;

    @POST
    public Response createUser(User user) {
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
    public Response checkUserExists(@PathParam("username") String username) {
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