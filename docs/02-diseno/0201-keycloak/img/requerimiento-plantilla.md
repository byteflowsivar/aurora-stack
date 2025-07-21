### Prompt para Claude Code: Creación de Template Keycloak con shadcn UX


**Objetivo:** Crear un tema personalizado de Keycloak usando shadcn UX para las páginas de autenticación, que será montado en Docker Compose en `./packages/keycloak-themes`

---

### **Requisitos Técnicos**
1. **Estructura de Carpetas**:
   ```
   aurora-theme/
   ├── login/
   │   ├── login.ftl
   │   ├── login-reset-password.ftl
   │   ├── login-update-password.ftl
   │   ├── login-update-profile.ftl
   │   └── login-verify-email.ftl
   ├── account/
   │   └── ... (opcional)
   └── theme.properties
   ```

2. **Dependencias CSS/JS**:
   - Usar CDN para:
     - Tailwind CSS v3.3+
     - shadcn UX components
     - Google Fonts (Inter)
   - **No usar** build tools (webpack, etc.)

---

### **Instrucciones Paso a Paso**
1. **Configurar theme.properties**:
   ```properties
   parent=base
   import=common/keycloak
   stylesheets=css/styles.css
   ```

2. **Implementar CSS base (styles.css)**:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
   @import url('https://cdn.jsdelivr.net/npm/tailwindcss@3.3/dist/tailwind.min.css');
   
   :root {
     --primary: #0f1a38;
     --secondary: #7b61ff;
     --accent: #2bd6a3;
   }
   
   body {
     font-family: 'Inter', sans-serif;
     @apply bg-gray-50;
   }
   ```

3. **Plantilla Base (common-header.ftl)**:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>${msg("loginTitle",(realm.displayName!''))}</title>
     <#if properties.styles?has_content>
       <#list properties.styles?split(' ') as style>
         <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
       </#list>
     </#if>
   </head>
   <body class="flex items-center justify-center min-h-screen">
     <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
   ```

4. **Componentes shadcn UX**:
   ```html
   <!-- Botón Primario -->
   <button class="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-opacity-90 transition">
     ${msg("doLogIn")}
   </button>
   
   <!-- Input Field -->
   <div class="space-y-2">
     <label class="block text-sm font-medium text-gray-700">${msg("email")}</label>
     <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
   </div>
   ```

5. **Página de Login (login.ftl)**:
   ```html
   <#include "common-header.ftl">
     <h1 class="text-2xl font-bold text-center">${realm.displayName!'Aurora Stack'}</h1>
     <#if message?has_content>
       <div class="p-3 mb-4 rounded-md bg-red-50 text-red-700">
         ${message.summary}
       </div>
     </#if>
     <form id="kc-form-login" action="${url.loginAction}" method="post">
       <!-- Campos de usuario/contraseña -->
       <button type="submit" class="w-full btn-primary">${msg("doLogIn")}</button>
     </form>
     <div class="mt-4 text-center">
       <a href="${url.loginResetCredentialsUrl}" class="text-sm text-[var(--secondary)] hover:underline">
         ${msg("doForgotPassword")}
       </a>
     </div>
   </div>
   </body>
   </html>
   ```

6. **Página Reset Password (login-reset-password.ftl)**:
   ```html
   <#include "common-header.ftl">
     <h1 class="text-2xl font-bold text-center">${msg("doForgotPassword")}</h1>
     <form action="${url.loginAction}" method="post">
       <div class="space-y-4">
         <div>
           <label>${msg("email")}</label>
           <input type="text" name="username" autofocus>
         </div>
         <button type="submit" class="w-full btn-primary">
           ${msg("doSubmit")}
         </button>
         <a href="${url.loginUrl}" class="block text-center text-[var(--secondary)] hover:underline">
           ${msg("backToLogin")}
         </a>
       </div>
     </form>
   </div>
   </body>
   </html>
   ```

---

### **Requerimientos Específicos**
1. **Personalización Visual**:
   - La paleta de colores esta en la imagen docs/02-diseno/0201-keycloak/img/color-palette.png
   - Animaciones suaves en hover/focus
   - Responsive (mobile-first)
   - Toma como ejemplo de las pantalla la imagen: docs/02-diseno/0201-keycloak/img/login-base.png

2. **Elementos Obligatorios**:
   - El nombre debe ser personalizable, en texto de preferencia y para este caso debe ser "Aurora Stack"
   - Mensajes de error/éxito estilizados
   - Links de navegación entre flujos
   - Soporte para social logins (Google, etc.) y para el Realm esta soportado.

3. **Optimizaciones**:
   - CSS en ~15kb
   - 0 dependencias JS externas
   - Compatible con Keycloak 26+

---

### **Validaciones**
1. Integrar mensajes de Keycloak:
   ```html
   <#if message?has_content>
     <div class="alert ${message.type}">${message.summary}</div>
   </#if>
   ```

2. Mantener hooks de Keycloak:
   ```html
   <input type="hidden" name="execution" value="${execution}"/>
   <input type="hidden" name="client_id" value="${client.clientId}"/>
   ```

---

### **Instrucciones Docker Compose**
```yaml
services:
    keycloak:
    image: quay.io/keycloak/keycloak:26.3
    container_name: keycloak
    # command: start --optimized
    command: start-dev
    env_file:
      - .env
    environment:
      KC_HOSTNAME: ${KC_HOSTNAME}
      KC_HTTP_ENABLED: ${KC_HTTP_ENABLED}
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://keycloak_db:5432/${KC_POSTGRES_DB}
      KC_DB_USERNAME: ${KC_POSTGRES_USER}
      KC_DB_PASSWORD: ${KC_POSTGRES_PASSWORD}
      KC_BOOTSTRAP_ADMIN_USERNAME: ${KC_BOOTSTRAP_ADMIN_USERNAME}
      KC_BOOTSTRAP_ADMIN_PASSWORD: ${KC_BOOTSTRAP_ADMIN_PASSWORD}
      KC_PROXY: edge
      KC_HOSTNAME_STRICT_HTTPS: false
    ports:
      - 8089:8080
      - 8443:8443
    depends_on:
      keycloak_db:
        condition: service_healthy
    networks:
      - keycloak-network
    restart: unless-stopped
    volumes:
      - ./packages/keycloak-themes:/opt/keycloak/themes  # Opcional para temas personalizados
```

---

### **Entrega Esperada**
1. Carpeta `aurora-theme` completa
2. Instrucciones para asignar el tema en Keycloak Admin Console:
   - Realm Settings > Themes
   - Login Theme: "aurora-theme"
3. Screenshot de preview en modo claro/oscuro
```

### Pasos Adicionales para Claude:
1. **Priorizar componentes shadcn**:
   - Botones con `hover:scale-[1.02] transition-transform`
   - Inputs con `focus:ring-2 focus:ring-[var(--accent)]`
   - Tarjetas con `shadow-lg rounded-xl`

   ```

3. **Elementos de marca**:
   ```html
   <div class="flex justify-center mb-6">
     <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
   </div>
   ```

4. **Micro-interacciones**:
   - Animación de carga en submit
   - Transición suave entre formularios
   - Feedback visual en errores
