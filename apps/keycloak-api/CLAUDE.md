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

**Proyecto en estado inicial**: Contiene solo un endpoint de ejemplo `/hello`. La integración con Keycloak aún no está implementada.

### Próximos Pasos para Keycloak

1. **Dependencias requeridas** (agregar a `pom.xml`):
   - `quarkus-keycloak-admin-client`
   - `quarkus-oidc` o `quarkus-keycloak-authorization`

2. **Configuración** en `application.properties`:
   - URL del servidor Keycloak
   - Credenciales de administrador
   - Configuración del Realm

3. **Endpoints a implementar**:
   - Crear usuarios no administradores
   - Asignar passwords a usuarios
   - Autenticación con client del Realm

## Archivos Clave

- **pom.xml**: Configuración de dependencias y build
- **src/main/resources/application.properties**: Configuración de la aplicación
- **src/main/java/com/byteflowsivar/aurora/**: Código fuente principal
- **src/test/**: Tests unitarios e integración

## Convenciones

- **Paquete base**: `com.byteflowsivar.aurora`
- **Endpoints REST**: Usar JAX-RS con `@Path`
- **Tests**: Separar tests unitarios (`*Test.java`) de integración (`*IT.java`)
- **Configuración**: Usar `application.properties` para configuración externa