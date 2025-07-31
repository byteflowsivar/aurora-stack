package com.byteflowsivar.aurora.resource;

import com.byteflowsivar.aurora.service.KeycloakUserService;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.InjectMock;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

@QuarkusTest
public class UserResourceTest {

    @InjectMock
    KeycloakUserService keycloakUserService;

    @Test
    public void testCreateUserSuccess() {
        Mockito.when(keycloakUserService.userExists(anyString())).thenReturn(false);
        Mockito.when(keycloakUserService.createUser(any())).thenReturn("user-123");

        given()
            .contentType(ContentType.JSON)
            .body("{\n" +
                  "  \"username\": \"testuser\",\n" +
                  "  \"email\": \"test@example.com\",\n" +
                  "  \"firstName\": \"Test\",\n" +
                  "  \"lastName\": \"User\",\n" +
                  "  \"password\": \"password123\",\n" +
                  "  \"enabled\": true\n" +
                  "}")
        .when()
            .post("/users")
        .then()
            .statusCode(201)
            .body("userId", is("user-123"))
            .body("username", is("testuser"))
            .body("message", is("User created successfully"));
    }

    @Test
    public void testCreateUserAlreadyExists() {
        Mockito.when(keycloakUserService.userExists("existinguser")).thenReturn(true);

        given()
            .contentType(ContentType.JSON)
            .body("{\n" +
                  "  \"username\": \"existinguser\",\n" +
                  "  \"email\": \"existing@example.com\",\n" +
                  "  \"firstName\": \"Existing\",\n" +
                  "  \"lastName\": \"User\",\n" +
                  "  \"password\": \"password123\",\n" +
                  "  \"enabled\": true\n" +
                  "}")
        .when()
            .post("/users")
        .then()
            .statusCode(409)
            .body("error", is("User already exists"));
    }

    @Test
    public void testCreateUserValidationError() {
        Mockito.when(keycloakUserService.userExists(anyString())).thenReturn(false);
        Mockito.when(keycloakUserService.createUser(any())).thenThrow(new IllegalArgumentException("Username is required"));

        given()
            .contentType(ContentType.JSON)
            .body("{\n" +
                  "  \"username\": \"\",\n" +
                  "  \"email\": \"test@example.com\",\n" +
                  "  \"firstName\": \"Test\",\n" +
                  "  \"lastName\": \"User\",\n" +
                  "  \"password\": \"password123\",\n" +
                  "  \"enabled\": true\n" +
                  "}")
        .when()
            .post("/users")
        .then()
            .statusCode(400)
            .body("error", is("Username is required"));
    }

    @Test
    public void testCheckUserExists() {
        Mockito.when(keycloakUserService.userExists("testuser")).thenReturn(true);

        given()
        .when()
            .get("/users/testuser/exists")
        .then()
            .statusCode(200)
            .body("username", is("testuser"))
            .body("exists", is(true));
    }

    @Test
    public void testCheckUserNotExists() {
        Mockito.when(keycloakUserService.userExists("nonexistent")).thenReturn(false);

        given()
        .when()
            .get("/users/nonexistent/exists")
        .then()
            .statusCode(200)
            .body("username", is("nonexistent"))
            .body("exists", is(false));
    }
}