# 0201 - Keycloak

Esta sección documenta la **configuración completa del sistema de autenticación** Keycloak para Aurora Stack, incluyendo realms, clients, roles y personalizaciones.

## 📂 Documentos

### realm-config.md
**Estructura de realms y clients**

Documenta la configuración de Keycloak:
- **Realms**: Configuración de dominios de autenticación
- **Clients**: Aplicaciones registradas y sus configuraciones
- **Service Accounts**: Configuración para comunicación entre servicios
- **Protocolos**: OIDC, SAML y configuraciones específicas

### roles-permisos.md
**Matriz de permisos y roles**

Define el modelo de autorización:
- **Roles del Sistema**: Roles globales y específicos de realm
- **Permisos por Funcionalidad**: Matriz de acceso a recursos
- **Grupos de Usuario**: Agrupaciones y herencia de roles
- **Policies**: Reglas de autorización complejas

### themes/
**Plantillas personalizadas**

Contiene las personalizaciones de interfaz:
- **Login Theme**: Personalización de páginas de autenticación
- **Account Theme**: Personalización del portal de usuario
- **Admin Theme**: Personalización del panel administrativo
- **Email Templates**: Plantillas de correos del sistema

## 🔧 Configuración Actual

### Información de Conexión
- **Puerto HTTP**: 8089
- **Puerto HTTPS**: 8443
- **Modo**: Desarrollo (start-dev)
- **Base de Datos**: PostgreSQL (keycloak_db)
- **Admin**: admin/keycloak (desarrollo)

### Redes Docker
- **Red**: keycloak-network
- **Dependencias**: keycloak_db (PostgreSQL)

## 📋 Formato de Documentación

### Para realm-config.md:
```markdown
## Realm: [Nombre del Realm]

### Configuración General
- **Nombre**: nombre-realm
- **Display Name**: Nombre Mostrado
- **Enabled**: true/false
- **SSL Required**: external requests

### Clients
| Nombre | Tipo | Protocolo | URLs | Service Account |
|--------|------|-----------|------|-----------------|
| aurora-admin-ui | public | openid-connect | http://localhost:3000/* | No |
| aurora-backend | confidential | openid-connect | http://localhost:8080/* | Sí |

### Roles
| Rol | Descripción | Scope |
|-----|-------------|-------|
| admin | Administrador completo | Global |
| user | Usuario básico | Aplicación |
```

### Para roles-permisos.md:
```markdown
## Matriz de Permisos

| Recurso/Acción | admin | manager | user | guest |
|----------------|-------|---------|------|-------|
| Crear Usuario | ✅ | ✅ | ❌ | ❌ |
| Ver Reportes | ✅ | ✅ | 📋 | ❌ |
| Configurar Sistema | ✅ | ❌ | ❌ | ❌ |

**Leyenda**: ✅ Permitido | ❌ Denegado | 📋 Solo propios
```

## 🎨 Personalización de Themes

### Estructura de Directorios:
```
packages/keycloak-themes/
├── aurora-login/
│   ├── login/
│   │   ├── login.ftl
│   │   └── theme.properties
│   └── resources/
│       ├── css/
│       ├── js/
│       └── img/
└── aurora-account/
    ├── account/
    └── resources/
```

### Elementos Personalizables:
- **Colores y Branding**: Logo, paleta de colores corporativa
- **Formularios**: Campos adicionales, validaciones personalizadas
- **Flujos**: Páginas de bienvenida, términos y condiciones
- **Notificaciones**: Mensajes de error y éxito personalizados

## 🔒 Configuración de Seguridad

### Políticas Recomendadas:
- **Passwords**: Complejidad mínima, expiración
- **Sesiones**: Timeout, SSO session idle
- **Brute Force**: Protección contra ataques
- **OTP**: Configuración de 2FA/MFA

### Service Accounts:
```markdown
## Service Account: aurora-backend

### Roles Asignados
- realm-management: manage-users
- realm-management: view-users
- realm-management: manage-clients

### Configuración
- Client Authentication: On
- Service Accounts Enabled: On
- Standard Flow Enabled: Off
```

## 🔄 Procedimientos de Mantenimiento

### Backup de Configuración:
```bash
# Exportar realm completo
docker exec keycloak /opt/keycloak/bin/kc.sh export --realm aurora-realm --file /tmp/aurora-realm.json

# Exportar solo usuarios
docker exec keycloak /opt/keycloak/bin/kc.sh export --realm aurora-realm --users realm_file --file /tmp/aurora-users.json
```

### Aplicar Cambios de Themes:
```bash
# Reiniciar contenedor para aplicar cambios
docker compose restart keycloak
```

## 📊 Monitoreo y Logs

### Eventos a Monitorear:
- Logins exitosos/fallidos
- Cambios de configuración
- Creación/modificación de usuarios
- Cambios de roles y permisos

### Logs Importantes:
- Authentication errors
- Admin console activities
- Service account usage
- Theme loading errors