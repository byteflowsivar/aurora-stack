# GitHub Project Management Tools for Aurora Stack

Este directorio contiene herramientas automatizadas para configurar y gestionar el proyecto Aurora Stack en GitHub usando GitHub Projects (roadmap) y las mejores prácticas de gestión de proyectos.

## 📋 Descripción General

Los scripts automatizados en este directorio te ayudan a:
- ⚡ **Configurar campos personalizados** para tracking de tiempo y costos
- 🏷️ **Crear sistema de etiquetas** consistente y semántico
- 📝 **Generar issues de ejemplo** basados en la documentación del proyecto
- 🎨 **Configurar vistas optimizadas** para diferentes workflows

## 🚀 Inicio Rápido

### Prerequisitos
```bash
# Instalar GitHub CLI
brew install gh

# Autenticarse con GitHub
gh auth login

# Instalar dependencias Node.js
npm install
```

### Configuración Inicial
```bash
# 1. Inicializar archivo de configuración
npm run init

# 2. Editar .env con tus datos
# Para usuarios individuales:
# GITHUB_OWNER=tu-usuario-github
# GITHUB_OWNER_TYPE=user
# PROJECT_NUMBER=1

# Para organizaciones:
# GITHUB_OWNER=tu-organizacion
# GITHUB_OWNER_TYPE=org  
# PROJECT_NUMBER=1

# Configuración adicional:
# REPO_NAME=aurora-stack
# HOURLY_RATE=50
```

### Ejecución en Orden Secuencial
```bash
# 0. PRIMERO: Validar permisos y configuración
npm run validate
# o
node 00-validate-permissions.js

# 1. Configurar campos personalizados del proyecto
node 01-setup-project-fields.js

# 2. Configurar etiquetas del repositorio
node 02-setup-repository-labels.js

# 3. Crear issues de ejemplo
node 03-create-sample-issues.js

# 4. Configurar vistas del proyecto (guía manual)
node 04-setup-project-views.js

# O ejecutar todo de una vez (incluye validación)
npm run setup:all
```

## 📚 Documentación Detallada de Scripts

### 00-validate-permissions.js
**Propósito**: Valida permisos y prerequisitos antes de ejecutar cualquier configuración.

**Validaciones que realiza**:
- ✅ GitHub CLI instalado y versión mínima
- ✅ Autenticación con GitHub
- ✅ Archivo .env configurado correctamente
- ✅ Variables de entorno requeridas
- ✅ Acceso al repositorio con permisos de escritura
- ✅ Acceso al proyecto GitHub Projects
- ✅ Rate limits de la API suficientes

**Ejemplo de uso**:
```bash
# Configurar .env primero
cp .env.example .env
# Editar .env con tus valores

# Validar configuración
node 00-validate-permissions.js
```

**Salida esperada**:
```
🛡️ VALIDACIÓN DE PERMISOS Y PREREQUISITES PARA AURORA STACK
===============================================================

🔍 VALIDANDO GITHUB CLI
✅ GitHub CLI v2.40.1 instalado correctamente

🔐 VALIDANDO AUTENTICACIÓN  
✅ Autenticado como: rex2002xp (Rex Developer)
✅ Token de acceso configurado correctamente

🌍 VALIDANDO VARIABLES DE ENTORNO
✅ Archivo .env encontrado
✅ GITHUB_OWNER="rex2002xp"
✅ GITHUB_OWNER_TYPE="user" (default)
✅ PROJECT_NUMBER="1" (default)
✅ REPO_NAME="aurora-stack" (default)

📁 VALIDANDO ACCESO AL REPOSITORIO
✅ Repositorio: rex2002xp/aurora-stack
✅ Permisos: Admin=true, Push=true

📊 VALIDANDO ACCESO AL PROYECTO
✅ Proyecto: Aurora Stack Roadmap
   Tipo: Usuario  # o "Organización" para organizaciones
✅ Permisos de escritura en el proyecto confirmados

⏱️ VALIDANDO RATE LIMITS DE LA API
✅ Core API: 4856/5000 requests (97.1%)
✅ GraphQL API: 4950/5000 points (99.0%)

🎉 ¡TODAS LAS VALIDACIONES PASARON!

🚀 Puedes continuar con la configuración:
   1. node 01-setup-project-fields.js
   2. node 02-setup-repository-labels.js
   3. node 03-create-sample-issues.js
   4. node 04-setup-project-views.js

📄 Reporte de validación guardado en: .validation-report.json
```

### 01-setup-project-fields.js
**Propósito**: Configura campos personalizados en GitHub Projects para tracking avanzado.

**Campos que crea**:
- **Estimation** (Number): Horas estimadas
- **Priority** (Select): High, Medium, Low
- **Epic** (Text): Para agrupar tareas
- **Component** (Select): Área del sistema (Infrastructure, Authentication, etc.)
- **Story Points** (Number): Puntos de historia (Fibonacci)
- **Actual Hours** (Number): Horas reales trabajadas
- **Cost Estimate** (Number): Costo en USD
- **Quarter** (Select): Planificación trimestral

**Ejemplo de uso**:
```bash
# Asegurar que .env está configurado
# GITHUB_OWNER=rex2002xp  
# GITHUB_OWNER_TYPE=user  # o 'org' para organizaciones
# PROJECT_NUMBER=1
# HOURLY_RATE=50

node 01-setup-project-fields.js
```

**Salida esperada**:
```
🚀 Iniciando configuración de campos personalizados para GitHub Project
📊 Proyecto: rex2002xp/1

🔍 Verificando prerequisitos...
✅ GitHub CLI instalado
✅ GitHub CLI autenticado

🔍 Obteniendo ID del proyecto 1...
✅ Proyecto encontrado: project_id_aqui

📝 Creando campos personalizados...
✅ Campo creado: Estimation
✅ Campo creado: Priority
...
✅ ¡Configuración de campos completada!
```

### 02-setup-repository-labels.js
**Propósito**: Crea un sistema consistente de etiquetas para clasificar issues y PRs.

**Categorías de etiquetas**:
- **Tipos de trabajo**: `type: feature`, `type: bug`, `type: documentation`
- **Prioridades**: `priority: high`, `priority: medium`, `priority: low`
- **Componentes**: `component: keycloak`, `component: database`, `component: api`
- **Estados**: `status: blocked`, `status: waiting-review`, `status: ready-to-test`
- **Esfuerzo**: `effort: epic`, `effort: good-first-issue`, `effort: quick-win`

**Colores semánticos**:
- 🔴 Rojos: Bugs y problemas críticos
- 🔵 Azules: Features y mejoras
- 🟢 Verdes: Documentación y tareas completadas
- 🟠 Naranjas: Prioridades y warnings
- 🟣 Púrpuras: Componentes del sistema

**Ejemplo de uso**:
```bash
node 02-setup-repository-labels.js
```

### 03-create-sample-issues.js
**Propósito**: Crea issues de ejemplo que demuestran el uso de campos personalizados y mejores prácticas.

**Issues que crea**:
- **Epics principales**: Infraestructura, Keycloak, etc.
- **Features específicas**: Tema personalizado, configuración DB
- **Tasks técnicas**: Documentación, CI/CD
- **Bugs de ejemplo**: Para demostrar formato de reporte

**Estructura de issue**:
```markdown
## Descripción
[Descripción clara del trabajo]

## Tareas
- [ ] Tarea 1
- [ ] Tarea 2

## Criterios de Aceptación
- Criterio 1
- Criterio 2

## Estimación
- **Story Points**: 8
- **Horas Estimadas**: 24
- **Costo Estimado**: $1200

## Referencias Técnicas
- Links a documentación relevante
```

### 04-setup-project-views.js
**Propósito**: Proporciona guías para configurar vistas optimizadas en GitHub Projects.

**Vistas recomendadas**:
1. **📋 Roadmap**: Vista temporal para planificación
2. **🏃 Sprint Board**: Kanban para desarrollo activo
3. **📊 Metrics Dashboard**: Vista de métricas y costos
4. **🏗️ By Component**: Agrupado por área del sistema
5. **⚡ Priority Queue**: Ordenado por prioridad
6. **👥 Team View**: Vista por responsable

**Nota**: Debido a limitaciones de la API, este script genera guías para configuración manual.

## 💰 Gestión de Costos del Proyecto

### Fórmula de Cálculo
```
Costo Total = (Horas Estimadas × Tarifa Horaria) + Costos Fijos
```

### Ejemplo para Aurora Stack
Basado en los issues de ejemplo creados:

| Componente | Horas Est. | Tarifa | Subtotal |
|------------|------------|--------|----------|
| Infraestructura | 40h | $50/h | $2,000 |
| Keycloak Integration | 60h | $50/h | $3,000 |
| Database Setup | 24h | $50/h | $1,200 |
| Documentation | 16h | $40/h | $640 |
| Testing & QA | 32h | $45/h | $1,440 |
| **TOTAL** | **172h** | - | **$8,280** |

### Tracking en GitHub Projects
1. **Campo "Estimation"**: Horas estimadas por tarea
2. **Campo "Actual Hours"**: Horas reales trabajadas
3. **Campo "Cost Estimate"**: Cálculo automático del costo
4. **Vista "Metrics Dashboard"**: Resumen de costos por componente

### Exportación de Datos
```bash
# Exportar issues con estimaciones
gh issue list --repo owner/repo --json number,title,labels,body --limit 100 > issues_export.json

# Procesar con script personalizado para calcular totales
node calculate_project_costs.js issues_export.json
```

## 🎯 Flujo de Trabajo Recomendado

### 1. Planificación (Trimestral)
```bash
# Vista: 📋 Roadmap
# Actividades:
# - Revisar epics en backlog
# - Asignar trimestres (Q1, Q2, etc.)
# - Estimar story points y horas
# - Calcular costos por trimestre
```

### 2. Sprint Planning (Bisemanal)
```bash
# Vista: 🏃 Sprint Board
# Actividades:
# - Mover issues de backlog a "Ready"
# - Asignar responsables
# - Desglosar epics en tasks
# - Verificar estimaciones
```

### 3. Desarrollo Diario
```bash
# Vista: ⚡ Priority Queue
# Actividades:
# - Revisar prioridades altas
# - Actualizar estado de issues
# - Loggar horas reales trabajadas
# - Crear nuevos issues según necesidad
```

### 4. Review Semanal
```bash
# Vista: 📊 Metrics Dashboard
# Actividades:
# - Comparar horas estimadas vs reales
# - Ajustar estimaciones futuras
# - Revisar costos del proyecto
# - Generar reportes de progreso
```

## 🔧 Personalización

### Variables de Entorno

Todas las variables se configuran en el archivo `.env`:

```bash
# Configuración del repositorio
GITHUB_OWNER=tu-usuario-o-org
GITHUB_OWNER_TYPE=user  # 'user' o 'org'
REPO_NAME=tu-repositorio  
PROJECT_NUMBER=1

# Configuración de costos
HOURLY_RATE=50  # Tarifa por hora en USD
CURRENCY=USD

# Configuración adicional
TEAM_NAME=Aurora Stack Team
TIMEZONE=America/Mexico_City
```

Ver `.env.example` para todas las opciones disponibles.

### Modificar Campos Personalizados
Edita `01-setup-project-fields.js`:
```javascript
const CONFIG = {
  CUSTOM_FIELDS: [
    {
      name: 'Tu Campo Personalizado',
      type: 'single_select',
      description: 'Descripción del campo',
      options: [
        { name: 'Opción 1', description: 'Descripción' },
        { name: 'Opción 2', description: 'Descripción' }
      ]
    }
  ]
};
```

### Modificar Etiquetas
Edita `02-setup-repository-labels.js`:
```javascript
const CONFIG = {
  LABELS: [
    {
      name: 'tu-etiqueta',
      color: 'ff0000',  // Color en hexadecimal
      description: 'Descripción de la etiqueta'
    }
  ]
};
```

## 📊 Métricas y Reportes

### Métricas Clave a Trackear
- **Velocity**: Story points completados por sprint
- **Burn Rate**: Horas consumidas vs estimadas
- **Cost Performance**: Costo real vs presupuestado
- **Quality**: Issues vs bugs creados
- **Timeline**: Fechas estimadas vs reales de entrega

### Automatización de Reportes
```bash
# Script para generar reporte semanal
#!/bin/bash
echo "Generando reporte de proyecto..."

# Obtener issues completados esta semana
gh issue list --state closed --search "closed:>$(date -d '1 week ago' +%Y-%m-%d)"

# Calcular métricas
node tools/github/generate-weekly-report.js
```

## 🛠️ Solución de Problemas

### Error: "Project not found"
```bash
# Verificar que las variables estén configuradas
echo $GITHUB_OWNER
echo $PROJECT_NUMBER

# Verificar que el proyecto existe
gh project list --owner $GITHUB_OWNER
```

### Error: "Authentication required"
```bash
# Re-autenticar con GitHub CLI
gh auth logout
gh auth login --scopes "project,repo"
```

### Error: "Field already exists"
```bash
# Los campos ya existen, esto es normal
# El script intentará actualizar campos existentes
```

## 🤝 Contribución

Para contribuir a estos scripts:
1. Fork el repositorio
2. Crea una branch para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit de tus cambios: `git commit -am 'Add nueva funcionalidad'`
4. Push a la branch: `git push origin feature/nueva-funcionalidad`
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo LICENSE para más detalles.

## 🆘 Soporte

Si encuentras problemas o tienes preguntas:
1. Revisa la sección de solución de problemas arriba
2. Abre un issue en el repositorio
3. Consulta la documentación oficial de GitHub Projects
4. Revisa los logs de ejecución de los scripts

---

**Nota**: Estos scripts están diseñados específicamente para Aurora Stack pero pueden adaptarse fácilmente a otros proyectos modificando la configuración en cada script.