# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción del Proyecto

Este API integra la parte administrativa de Keycloak, permitiendo por el momento solo crear usuarios y asignarles su password. Los usuarios que se deben crear no son administradores del Realm sino usuarios que se pueden autenticar usando un client creado en el Realm.

## Arquitectura

- **Framework**: Quarkus 3.25.0 (Java supersonic subatomic framework)
- **Java**: Version 21
- **Build Tool**: Maven 3.9.9 con Maven wrapper
- **Estructura**: Proyecto Maven estándar con empaquetado JAR y compilación nativa
- **Testing**: JUnit 5 con REST Assured para pruebas de API

## Comandos Principales

### Desarrollo
```bash
# Modo desarrollo con live reload
./mvnw quarkus:dev

# Ejecutar en puerto específico
./mvnw quarkus:dev -Dquarkus.http.port=8080
```

### Build y Empaquetado
```bash
# Build JAR estándar
./mvnw package

# Build uber-JAR (incluye todas las dependencias)
./mvnw package -Dquarkus.package.jar.type=uber-jar

# Compilación nativa (requiere GraalVM)
./mvnw package -Dnative
```

### Testing
```bash
# Ejecutar tests unitarios
./mvnw test

# Ejecutar tests de integración
./mvnw verify

# Ejecutar test específico
./mvnw test -Dtest=GreetingResourceTest
```

### Containerización
```bash
# Build imagen Docker JVM
docker build -f src/main/docker/Dockerfile.jvm -t keycloak-api-jvm .

# Build imagen Docker nativa
docker build -f src/main/docker/Dockerfile.native -t keycloak-api-native .
```

## Estructura del Código

Se debe implementar la arquitectura Domain-Driven Design (DDD) con una estructura clara de paquetes.

- **com.byteflowsivar.aurora**: Paquete base del proyecto
  - **config**: Configuraciones de la aplicación
  - **domain**: Entidades y lógica de negocio
  - **service**: Servicios de negocio
  - **resource**: Endpoints REST (JAX-RS)
  - **security**: Configuración de seguridad y autenticación

## Estado Actual

**✅ Proyecto Implementado**: La integración con Keycloak está completamente funcional.

### Funcionalidades Implementadas

1. **Endpoints REST**:
   - `POST /users` - Crear usuario no administrador en Keycloak
   - `GET /users/{username}/exists` - Verificar existencia de usuario

2. **Arquitectura DDD**:
   - **Domain**: `User.java` - Entidad con validaciones de negocio
   - **Service**: `KeycloakUserService.java` - Lógica de integración con Keycloak
   - **Resource**: `UserResource.java` - Endpoints REST con manejo de errores
   - **Config**: `KeycloakConfig.java` - Configuración del cliente Keycloak

3. **Características de Seguridad**:
   - ✅ Creación de usuarios no administradores en realm `aurora-stack`
   - ✅ Asignación de passwords permanentes (no temporales)
   - ✅ Validación de datos obligatorios (username, email, password)
   - ✅ Verificación de usuarios existentes antes de crear
   - ✅ Cliente Keycloak dedicado con permisos mínimos

## Configuración de Keycloak

### Configuración de Seguridad Recomendada

**NO usar `admin-cli`** - Crear cliente específico para mejor seguridad:

1. **Crear Realm**: `aurora-stack`
2. **Crear Cliente**: `aurora-keycloak-api-client`
   - Access Type: `confidential`
   - Service Accounts Enabled: `ON`
3. **Asignar Roles Mínimos**:
   - `manage-users` (crear/modificar usuarios)
   - `view-users` (consultar usuarios existentes)
4. **Configurar Client Secret** en variables de entorno

### Variables de Entorno Requeridas

```bash
KEYCLOAK_CLIENT_SECRET=tu-client-secret-aqui
```

### Configuración application.properties

```properties
# Configuración del cliente Keycloak
quarkus.keycloak.admin-client.server-url=http://localhost:8089
quarkus.keycloak.admin-client.realm=aurora-stack
quarkus.keycloak.admin-client.client-id=aurora-api-client
quarkus.keycloak.admin-client.client-secret=${KEYCLOAK_CLIENT_SECRET}
quarkus.keycloak.admin-client.grant-type=client_credentials

# Realm objetivo para creación de usuarios
keycloak.target-realm=aurora-stack
```

## API Endpoints

### POST /users
Crea un nuevo usuario no administrador en Keycloak.

**Request Body**:
```json
{
  "username": "usuario123",
  "email": "usuario@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "password": "password123",
  "enabled": true
}
```

**Responses**:
- `201 Created`: Usuario creado exitosamente
- `400 Bad Request`: Datos de validación incorrectos
- `409 Conflict`: Usuario ya existe
- `500 Internal Server Error`: Error del servidor

### GET /users/{username}/exists
Verifica si un usuario existe en Keycloak.

**Responses**:
- `200 OK`: Retorna `{"username": "usuario123", "exists": true/false}`

## Testing

### Ejecutar Tests
```bash
# Tests completos con cobertura
./mvnw test

# Test específico
./mvnw test -Dtest=UserResourceTest
```

### Tests Implementados
- ✅ Creación exitosa de usuarios
- ✅ Validación de usuarios existentes
- ✅ Manejo de errores de validación
- ✅ Verificación de existencia de usuarios
- ✅ Tests con Mockito para aislamiento

## Archivos Clave

- **pom.xml**: Configuración de dependencias Maven
- **application.properties**: Configuración de Keycloak
- **KeycloakConfig.java**: Configuración del cliente
- **UserResource.java**: Endpoints REST
- **KeycloakUserService.java**: Lógica de negocio
- **User.java**: Entidad de dominio
- **UserResourceTest.java**: Tests unitarios

## Convenciones de Desarrollo

- **Arquitectura**: Domain-Driven Design (DDD)
- **Paquete base**: `com.byteflowsivar.aurora`
- **REST**: JAX-RS con `@Path` y manejo de errores HTTP
- **Tests**: JUnit 5 + Mockito + REST Assured
- **Configuración**: Properties externalizadas con variables de entorno
- **Seguridad**: Cliente Keycloak dedicado con permisos mínimos

## Mejores Prácticas de Seguridad

1. **Nunca usar admin-cli** en producción
2. **Cliente dedicado** con permisos específicos
3. **Client Secret** en variables de entorno
4. **Principio de menor privilegio** para roles
5. **Validación robusta** de datos de entrada
6. **Logs de auditoría** para acciones críticas