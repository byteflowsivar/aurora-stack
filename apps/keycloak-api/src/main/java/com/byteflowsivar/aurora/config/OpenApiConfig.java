package com.byteflowsivar.aurora.config;

import jakarta.ws.rs.core.Application;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Contact;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.info.License;
import org.eclipse.microprofile.openapi.annotations.servers.Server;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@OpenAPIDefinition(
    info = @Info(
        title = "Aurora Keycloak API",
        version = "1.0.0",
        description = """
            API para gestión de usuarios en Keycloak del proyecto Aurora Stack.
            
            Este API permite:
            - Crear usuarios no administradores en el realm de Keycloak
            - Asignar contraseñas permanentes a los usuarios
            - Verificar la existencia de usuarios
            
            Los usuarios creados pueden autenticarse usando clients configurados en el realm.
            """,
        contact = @Contact(
            name = "Aurora Stack Team",
            email = "aurora-stack@byteflowsivar.com"
        ),
        license = @License(
            name = "MIT License",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Desarrollo"),
        @Server(url = "https://api.aurora-stack.com", description = "Producción")
    },
    tags = {
        @Tag(name = "User Management", description = "Operaciones relacionadas con la gestión de usuarios")
    }
)
public class OpenApiConfig extends Application {
}