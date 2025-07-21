# Configuración del Tema Aurora en Keycloak

Esta guía documenta cómo configurar y activar el tema personalizado "aurora-theme" en Keycloak para Aurora Stack.

## 📁 Estructura del Tema

```
packages/keycloak-themes/aurora-theme/
├── theme.properties              # Configuración principal del tema
├── login/                       # Templates de autenticación
│   ├── resources/
│   │   └── css/
│   │       └── styles.css       # Estilos personalizados
│   ├── template.ftl             # Template base
│   ├── login.ftl               # Página de login principal
│   ├── login-reset-password.ftl # Recuperación de contraseña
│   ├── login-update-password.ftl # Actualización de contraseña
│   ├── login-update-profile.ftl # Actualización de perfil
│   └── login-verify-email.ftl   # Verificación de email
└── messages/
    └── messages_es.properties   # Mensajes en español
```

## 🎨 Características del Tema

### Paleta de Colores
- **Primario**: #16056B (Azul marino profundo)
- **Secundario**: #FD9619 (Naranja vibrante)
- **Accent**: #5696FA (Azul brillante)
- **Light**: #B4D7FE (Azul claro)

### Elementos de Diseño
- **Tipografía**: Inter (Google Fonts)
- **Framework CSS**: Tailwind CSS vía CDN
- **Componentes**: Inspirados en shadcn/ui
- **Responsive**: Mobile-first design
- **Animaciones**: Transiciones suaves y micro-interacciones

### Funcionalidades
- ✅ Formularios con validación visual
- ✅ Estados de loading en botones
- ✅ Mensajes de error/éxito estilizados
- ✅ Soporte para social logins
- ✅ Modo responsive
- ✅ Accesibilidad mejorada
- ✅ Animaciones CSS

## 🔧 Configuración en Keycloak

### Paso 1: Verificar Montaje del Volumen

El tema ya está montado automáticamente gracias a la configuración en `docker-compose.yml`:

```yaml
keycloak:
  # ... otras configuraciones
  volumes:
    - ./packages/keycloak-themes:/opt/keycloak/themes
```

### Paso 2: Acceder a Keycloak Admin Console

1. Navegar a: http://localhost:8089/admin/master/console/#/master/realms
2. Hacer clic en "Administration Console"
3. Iniciar sesión con:
   - **Usuario**: admin
   - **Contraseña**: keycloak

### Paso 3: Configurar el Tema en el Realm

1. En el panel izquierdo, ir a **"Realm Settings"**
2. Seleccionar la pestaña **"Themes"**
3. Configurar los siguientes campos:
   - **Login Theme**: `aurora-theme`
   - **Account Theme**: `aurora-theme` (opcional)
   - **Email Theme**: `aurora-theme` (opcional)
   - **Admin Console Theme**: `keycloak.v2` (mantener por defecto)
4. Hacer clic en **"Save"**

### Paso 4: Verificar Configuración

1. Cerrar sesión de Keycloak Admin Console
2. Navegar a la página de login: http://localhost:8089/realms/master/account
3. Verificar que el tema Aurora se está aplicando correctamente

## 🔄 Aplicar Cambios en Desarrollo

### Reiniciar Keycloak para Aplicar Cambios
```bash
# Reiniciar solo el contenedor de Keycloak
docker compose restart keycloak

# O reiniciar todo el stack
docker compose down && docker compose up -d
```

### Limpiar Cache de Keycloak
Si los cambios no se reflejan inmediatamente:

1. En Keycloak Admin Console, ir a **"Realm Settings" > "Themes"**
2. Cambiar temporalmente el tema a `keycloak`
3. Guardar cambios
4. Volver a cambiar a `aurora-theme`
5. Guardar cambios

## 📱 Testing del Tema

### Flujos a Validar

1. **Login Principal**
   - http://localhost:8089/realms/master/account
   - Probar login exitoso y con errores

2. **Recuperación de Contraseña**
   - Hacer clic en "¿Olvidaste tu contraseña?"
   - Verificar formulario y mensajes

3. **Responsive Design**
   - Probar en diferentes tamaños de pantalla
   - Verificar mobile experience

4. **Social Logins** (si están configurados)
   - Verificar styling de botones sociales

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🛠️ Personalización Adicional

### Modificar Colores
Editar las variables CSS en `styles.css`:
```css
:root {
  --primary: #16056B;    /* Color principal */
  --secondary: #FD9619;  /* Color secundario */
  --accent: #5696FA;     /* Color de acento */
  --light: #B4D7FE;      /* Color claro */
}
```

### Cambiar Logo
Modificar el contenido del div `.kc-logo` en los templates:
```html
<div class="kc-logo">
  <!-- Reemplazar "A" con logo personalizado -->
  <img src="${url.resourcesPath}/img/logo.png" alt="Aurora Stack" />
</div>
```

### Agregar Nuevos Mensajes
Editar `messages/messages_es.properties`:
```properties
customMessage=Tu mensaje personalizado aquí
```

## 🔍 Troubleshooting

### Problema: El tema no se aplica
**Solución**:
1. Verificar que el volumen está montado correctamente
2. Reiniciar el contenedor de Keycloak
3. Limpiar cache del navegador
4. Verificar la configuración en Realm Settings

### Problema: CSS no se carga
**Solución**:
1. Verificar la ruta en `theme.properties`: `styles=css/styles.css`
2. Verificar que el archivo existe en `login/resources/css/styles.css`
3. Comprobar errores en la consola del navegador

### Problema: Templates no funcionan
**Solución**:
1. Verificar sintaxis de FreeMarker en los archivos `.ftl`
2. Revisar logs de Keycloak para errores de template
3. Comparar con templates base de Keycloak

### Problema: Funciones JavaScript no funcionan
**Solución**:
1. Verificar que no hay errores en la consola del navegador
2. Comprobar que los IDs de elementos coinciden
3. Verificar que el JavaScript está dentro de las etiquetas correctas

## 📝 Logs y Debugging

### Ver Logs de Keycloak
```bash
# Logs en tiempo real
docker compose logs -f keycloak

# Logs específicos de errores de themes
docker compose logs keycloak | grep -i theme
```

### Validar Sintaxis FreeMarker
Los templates usan FreeMarker. Errores comunes:
- Variables no definidas: `${variable!'valor_por_defecto'}`
- Condicionales: `<#if condition>...</#if>`
- Loops: `<#list items as item>...</#list>`

## 🔄 Actualizaciones Futuras

### Versionado del Tema
- Mantener changelog de cambios en el tema
- Probar cambios en entorno de desarrollo antes de producción
- Documentar personalizaciones específicas del cliente

### Compatibilidad
- El tema es compatible con Keycloak 26+
- Verificar compatibilidad al actualizar versiones de Keycloak
- Mantener respaldos de configuración antes de actualizaciones mayores