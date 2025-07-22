#!/usr/bin/env node

/**
 * 03-create-sample-issues.js
 * 
 * Script para crear issues de ejemplo y plantillas para el proyecto Aurora Stack
 * 
 * PROPÓSITO:
 * - Crear issues de ejemplo que demuestren el uso de los campos personalizados
 * - Establecer plantillas para diferentes tipos de issues
 * - Crear los Epics principales basados en la documentación del proyecto
 * - Demostrar buenas prácticas en la creación de issues
 * 
 * ISSUES QUE CREA:
 * - Epics principales del proyecto Aurora Stack
 * - Issues de ejemplo por cada componente
 * - Tasks específicas con estimaciones de tiempo y costo
 * 
 * ESTRUCTURA:
 * 1. Epics (issues grandes que agrupan work)
 * 2. Features (funcionalidades específicas)
 * 3. Tasks (tareas técnicas concretas)
 * 4. Bugs (ejemplos de reporte de errores)
 * 
 * PREREQUISITOS:
 * - Scripts 01 y 02 ejecutados previamente
 * - GitHub CLI instalado y autenticado
 * - Proyecto y etiquetas ya configurados
 */

const { execSync } = require('child_process');
const { join } = require('path');

// Cargar variables de entorno desde .env
require('dotenv').config({ path: join(__dirname, '.env') });

// Configuración del repositorio
const CONFIG = {
  REPO_OWNER: process.env.GITHUB_OWNER,
  REPO_NAME: process.env.REPO_NAME || 'aurora-stack',
  OWNER_TYPE: process.env.GITHUB_OWNER_TYPE || 'user',
  HOURLY_RATE: parseFloat(process.env.HOURLY_RATE || '30'),

  // Issues de ejemplo a crear
  SAMPLE_ISSUES: [
    // === EPICS PRINCIPALES ===
    {
      title: '[EPIC] Configuración de Infraestructura Base',
      body: `## Descripción
Configurar toda la infraestructura base del proyecto Aurora Stack incluyendo containerización, bases de datos y networking.

## 📋 Tareas para Completar este Epic
- [ ] Configurar Docker Compose para todos los servicios
- [ ] Setup PostgreSQL para Keycloak  
- [ ] Setup PostgreSQL para Aurora
- [ ] Establecer redes Docker aisladas
- [ ] Configurar health checks y monitoring básico
- [ ] Documentar proceso de despliegue

## Criterios de Aceptación
- Todos los servicios inician correctamente con \`docker compose up\`
- Las bases de datos están aisladas y configuradas
- La documentación está actualizada

## 📊 Estimación
- **Story Points**: 13
- **Horas Estimadas**: 40
- **Costo Estimado**: $1200 (40h × $30/h)

## 🔗 Dependencias
- Ninguna (Epic inicial)

## 📝 Notas
Este epic se considera **COMPLETADO** cuando todas las tareas arriba estén marcadas como ✅.

**Progreso**: 0/6 tareas completadas`,
      labels: ['effort: epic', 'type: infrastructure', 'priority: high', 'component: docker'],
      assignees: [],
      milestone: null,
      isEpic: true,
      subtasks: [
        'Configurar Docker Compose para todos los servicios',
        'Setup PostgreSQL para Keycloak',
        'Setup PostgreSQL para Aurora',
        'Establecer redes Docker aisladas',
        'Configurar health checks y monitoring básico',
        'Documentar proceso de despliegue'
      ]
    },

    {
      title: '[EPIC] Integración con Keycloak',
      body: `## Descripción
Implementar la integración completa con Keycloak para autenticación y autorización en Aurora Stack.

## Objetivos
- [ ] Configurar Keycloak server
- [ ] Crear temas personalizados Aurora
- [ ] Configurar realms y clients
- [ ] Implementar flows de autenticación
- [ ] Integrar con aplicaciones Aurora

## Criterios de Aceptación
- Keycloak está funcionando con tema personalizado
- Los usuarios pueden autenticarse correctamente
- Las aplicaciones Aurora usan Keycloak para auth

## Estimación
- **Story Points**: 21
- **Horas Estimadas**: 60
- **Costo Estimado**: $1800 (60h × $30/h)

## Dependencias
- Epic de Infraestructura Base

## Referencias
- Documentación: \`docs/02-diseno/0201-keycloak/\`
- Tema personalizado: \`packages/keycloak-themes/\``,
      labels: ['effort: epic', 'type: feature', 'priority: high', 'component: keycloak'],
      assignees: [],
      milestone: null
    },

    // === FEATURES ESPECÍFICAS ===
    {
      title: 'Implementar tema personalizado Aurora para Keycloak',
      body: `## Descripción
Crear un tema personalizado para Keycloak que refleje la identidad visual de Aurora Stack.

## Tareas
- [ ] Diseñar página de login siguiendo mockups
- [ ] Implementar estilos CSS personalizados
- [ ] Configurar colores y tipografías Aurora
- [ ] Crear assets (logos, íconos)
- [ ] Probar tema en diferentes dispositivos

## Criterios de Aceptación
- La página de login usa los colores y diseño Aurora
- El tema es responsive
- Funciona correctamente en navegadores modernos

## Referencias Técnicas
- Mockup: \`docs/02-diseno/0201-keycloak/img/login-base.png\`
- Paleta: \`docs/02-diseno/0201-keycloak/img/color-palette.png\`
- Config: \`docs/02-diseno/0201-keycloak/configuracion-tema-aurora.md\`

## Estimación
- **Story Points**: 5
- **Horas Estimadas**: 16
- **Costo Estimado**: $480`,
      labels: ['type: feature', 'component: keycloak', 'priority: medium'],
      assignees: [],
      milestone: null
    },

    {
      title: 'Configurar PostgreSQL con health checks y backups',
      body: `## Descripción
Configurar las instancias de PostgreSQL con monitoreo de salud y estrategia de backups.

## Tareas Técnicas
- [ ] Configurar health checks en docker-compose
- [ ] Implementar script de backup automático
- [ ] Configurar retention policy para backups
- [ ] Documentar proceso de recovery
- [ ] Crear alertas básicas de monitoreo

## Criterios de Aceptación
- Health checks funcionan correctamente
- Backups se ejecutan automáticamente
- La documentación de recovery está completa

## Estimación
- **Story Points**: 8
- **Horas Estimadas**: 24
- **Costo Estimado**: $720`,
      labels: ['type: infrastructure', 'component: database', 'priority: medium'],
      assignees: [],
      milestone: null
    },

    // === TASKS ESPECÍFICAS ===
    {
      title: 'Actualizar documentación de configuración de entorno',
      body: `## Descripción
Actualizar la documentación del archivo .env y proceso de configuración inicial.

## Tareas
- [ ] Documentar todas las variables de entorno
- [ ] Crear ejemplos para diferentes entornos (dev, staging, prod)
- [ ] Actualizar README con instrucciones paso a paso
- [ ] Validar que las instrucciones funcionan desde cero

## Archivos a Actualizar
- \`env.example\`
- \`README.md\`
- \`docs/03-implementacion/0302-guias-desarrollo/\`

## Estimación
- **Story Points**: 2
- **Horas Estimadas**: 4
- **Costo Estimado**: $120`,
      labels: ['type: documentation', 'effort: quick-win', 'priority: low'],
      assignees: [],
      milestone: null
    },

    {
      title: 'Configurar CI/CD pipeline básico',
      body: `## Descripción
Implementar un pipeline básico de CI/CD usando GitHub Actions.

## Funcionalidades
- [ ] Linting automático de código
- [ ] Testing de servicios Docker
- [ ] Build y validación de imágenes
- [ ] Deploy automático a staging

## Archivos a Crear
- \`.github/workflows/ci.yml\`
- \`.github/workflows/cd.yml\`
- Scripts de testing en \`scripts/\`

## Estimación
- **Story Points**: 13
- **Horas Estimadas**: 32
- **Costo Estimado**: $960`,
      labels: ['type: infrastructure', 'component: docker', 'priority: medium'],
      assignees: [],
      milestone: null
    },

    // === EJEMPLO DE BUG ===
    {
      title: 'Error de conexión a base de datos Keycloak en primer inicio',
      body: `## Descripción del Bug
Al ejecutar \`docker compose up\` por primera vez, Keycloak falla porque intenta conectar a PostgreSQL antes de que esté listo.

## Pasos para Reproducir
1. Clonar repositorio limpio
2. Configurar \`.env\` según \`env.example\`
3. Ejecutar \`docker compose up\`
4. Observar logs de keycloak

## Comportamiento Actual
Keycloak falla con error de conexión y se reinicia múltiples veces.

## Comportamiento Esperado
Keycloak debe esperar a que PostgreSQL esté listo antes de iniciar.

## Solución Propuesta
- [ ] Agregar \`depends_on\` con condition healthy
- [ ] Mejorar health check de PostgreSQL
- [ ] Agregar retry logic en Keycloak

## Estimación
- **Story Points**: 3
- **Horas Estimadas**: 6
- **Costo Estimado**: $180`,
      labels: ['type: bug', 'priority: high', 'component: docker', 'component: keycloak'],
      assignees: [],
      milestone: null
    }
  ]
};

/**
 * Ejecuta un comando de GitHub CLI con timeout
 * @param {string} command - Comando a ejecutar
 * @returns {string} - Salida del comando
 */
function runGhCommand(command) {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      timeout: 30000, // 30 segundos timeout
      stdio: 'pipe'   // Capturar salida
    });
    return result.trim();
  } catch (error) {
    if (error.status === 'TIMEOUT') {
      throw new Error(`Comando timeout después de 30 segundos: ${command}`);
    }
    console.error(`Error ejecutando comando: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Verifica si GitHub CLI está instalado y autenticado
 */
function checkPrerequisites() {
  console.log('🔍 Verificando prerequisitos...');

  try {
    runGhCommand('gh --version');
    console.log('✅ GitHub CLI instalado');
  } catch (error) {
    console.error('❌ GitHub CLI no está instalado. Instálalo con: brew install gh');
    process.exit(1);
  }

  try {
    runGhCommand('gh auth status');
    console.log('✅ GitHub CLI autenticado');
  } catch (error) {
    console.error('❌ GitHub CLI no está autenticado. Ejecuta: gh auth login');
    process.exit(1);
  }
}

/**
 * Crea un issue en el repositorio usando archivo temporal para el body
 * @param {object} issue - Configuración del issue
 * @returns {string} - URL del issue creado
 */
function createIssue(issue) {
  console.log(`📝 Creando issue: ${issue.title}`);

  try {
    const { writeFileSync, unlinkSync } = require('fs');
    const { join } = require('path');
    const os = require('os');

    // Crear archivo temporal para el body (evita problemas con comandos largos)
    const tempFile = join(os.tmpdir(), `issue-body-${Date.now()}.md`);
    writeFileSync(tempFile, issue.body, 'utf8');

    // Preparar comando base usando archivo temporal
    let command = `gh issue create --repo ${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}`;
    command += ` --title "${issue.title.replace(/"/g, '\\"')}"`;
    command += ` --body-file "${tempFile}"`;

    // Agregar etiquetas
    if (issue.labels && issue.labels.length > 0) {
      command += ` --label "${issue.labels.join(',')}"`;
    }

    // Agregar assignees si los hay
    if (issue.assignees && issue.assignees.length > 0) {
      command += ` --assignee "${issue.assignees.join(',')}"`;
    }

    // Agregar milestone si lo hay
    if (issue.milestone) {
      command += ` --milestone "${issue.milestone}"`;
    }

    console.log(`   Ejecutando: gh issue create --title "${issue.title}" --body-file [temp] ...`);
    const result = runGhCommand(command);

    // Limpiar archivo temporal
    try {
      unlinkSync(tempFile);
    } catch (cleanupError) {
      console.warn(`⚠️  No se pudo limpiar archivo temporal: ${tempFile}`);
    }

    console.log(`✅ Issue creado: ${result}`);
    return result;

  } catch (error) {
    console.error(`❌ Error creando issue '${issue.title}': ${error.message}`);
    return null;
  }
}

/**
 * Verifica si ya existen issues similares
 * @returns {Array} - Lista de issues existentes
 */
function getExistingIssues() {
  console.log('🔍 Verificando issues existentes...');

  try {
    const command = `gh issue list --repo ${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME} --state all --limit 100`;
    const result = runGhCommand(command);

    const issues = result.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split('\t');
      return {
        number: parts[0],
        title: parts[2] || '',
        state: parts[1] || ''
      };
    });

    console.log(`✅ Encontrados ${issues.length} issues existentes`);
    return issues;

  } catch (error) {
    console.warn('⚠️  No se pudieron obtener issues existentes');
    return [];
  }
}

/**
 * Genera reporte de issues creados
 * @param {Array} createdIssues - Issues creados exitosamente
 */
function generateReport(createdIssues) {
  console.log('\n📊 REPORTE DE ISSUES CREADOS\n');

  const categories = [
    { title: '🏔️ EPICS', filter: issue => issue.title.includes('[EPIC]') },
    { title: '✨ FEATURES', filter: issue => issue.labels?.includes('type: feature') && !issue.title.includes('[EPIC]') },
    { title: '🔧 INFRASTRUCTURE', filter: issue => issue.labels?.includes('type: infrastructure') && !issue.title.includes('[EPIC]') },
    { title: '📚 DOCUMENTATION', filter: issue => issue.labels?.includes('type: documentation') },
    { title: '🐛 BUGS', filter: issue => issue.labels?.includes('type: bug') }
  ];

  categories.forEach(category => {
    const issues = CONFIG.SAMPLE_ISSUES.filter(category.filter);
    if (issues.length > 0) {
      console.log(category.title);
      issues.forEach(issue => {
        const url = createdIssues.find(created => created.title === issue.title)?.url || 'No creado';
        console.log(`   • ${issue.title}`);
        console.log(`     URL: ${url}`);
      });
      console.log('');
    }
  });

  // Estadísticas
  const totalEstimatedHours = CONFIG.SAMPLE_ISSUES
    .map(issue => {
      const match = issue.body.match(/\*\*Horas Estimadas\*\*: (\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .reduce((sum, hours) => sum + hours, 0);

  const totalCost = CONFIG.SAMPLE_ISSUES
    .map(issue => {
      const match = issue.body.match(/\*\*Costo Estimado\*\*: \$(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .reduce((sum, cost) => sum + cost, 0);

  console.log('💰 RESUMEN DE ESTIMACIONES');
  console.log(`   Total Horas: ${totalEstimatedHours}h`);
  console.log(`   Costo Total: $${totalCost}`);
  console.log(`   Promedio por hora: $${totalCost / totalEstimatedHours || 0}`);
}

/**
 * Crea sub-issues para un epic y actualiza el epic con referencias
 * @param {object} epic - Epic issue
 * @param {string} epicUrl - URL del epic creado
 */
function createSubIssuesForEpic(epic, epicUrl) {
  if (!epic.isEpic || !epic.subtasks) return;

  console.log(`\n📋 Creando sub-issues para epic: ${epic.title}`);
  const subIssueUrls = [];

  epic.subtasks.forEach((subtask, index) => {
    const subIssue = {
      title: `${subtask}`,
      body: `## Descripción
${subtask}

## Epic Principal
Este issue forma parte del epic: ${epicUrl}

## Criterios de Aceptación
- [ ] Implementar funcionalidad requerida
- [ ] Escribir documentación
- [ ] Actualizar epic principal marcando esta tarea como completada

## 📊 Estimación
- **Story Points**: 3
- **Horas Estimadas**: ${Math.ceil(40 / epic.subtasks.length)}
- **Costo Estimado**: $${Math.ceil(2000 / epic.subtasks.length)}

## 🔗 Enlaces
- Epic Principal: ${epicUrl}`,
      labels: ['type: feature', 'priority: medium', ...epic.labels.filter(l => l.startsWith('component:'))],
      assignees: [],
      milestone: null
    };

    const subUrl = createIssue(subIssue);
    if (subUrl) {
      subIssueUrls.push(subUrl);
      console.log(`   ✅ Sub-issue ${index + 1}/${epic.subtasks.length}: ${subUrl}`);
    }
  });

  // Actualizar epic con referencias a sub-issues
  if (subIssueUrls.length > 0) {
    console.log(`\n🔗 Actualizando epic con referencias a ${subIssueUrls.length} sub-issues`);
    updateEpicWithSubIssues(epicUrl, epic, subIssueUrls);
  }
}

/**
 * Actualiza un epic con referencias a sus sub-issues
 * @param {string} epicUrl - URL del epic
 * @param {object} epic - Configuración del epic
 * @param {Array} subIssueUrls - URLs de los sub-issues
 */
function updateEpicWithSubIssues(epicUrl, epic, subIssueUrls) {
  try {
    // Extraer número del issue del URL
    const epicNumber = epicUrl.split('/').pop();

    // Crear tasklist con referencias a sub-issues
    const issueNumbers = subIssueUrls.map(url => url.split('/').pop());
    const taskList = epic.subtasks.map((task, index) =>
      `- [ ] ${task} #${issueNumbers[index]}`
    ).join('\n');

    const updatedBody = epic.body.replace(
      /## 📋 Tareas para Completar este Epic[\s\S]*?## Criterios/,
      `## 📋 Tareas para Completar este Epic
${taskList}

## Criterios`
    );

    // Actualizar el issue usando GitHub CLI
    const { writeFileSync, unlinkSync } = require('fs');
    const { join } = require('path');
    const os = require('os');

    const tempFile = join(os.tmpdir(), `epic-update-${Date.now()}.md`);
    writeFileSync(tempFile, updatedBody, 'utf8');

    const command = `gh issue edit ${epicNumber} --repo ${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME} --body-file "${tempFile}"`;
    runGhCommand(command);

    unlinkSync(tempFile);
    console.log(`   ✅ Epic actualizado con referencias a sub-issues`);

  } catch (error) {
    console.error(`   ❌ Error actualizando epic: ${error.message}`);
  }
}

/**
 * Función principal
 */
function main() {
  console.log('📝 Iniciando creación de issues de ejemplo para Aurora Stack');
  console.log(`📁 Repositorio: ${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}\n`);

  // Verificar prerequisitos
  checkPrerequisites();

  // Obtener issues existentes
  const existingIssues = getExistingIssues();

  // Crear issues
  console.log('\n📝 Creando issues de ejemplo...');
  const createdIssues = [];

  CONFIG.SAMPLE_ISSUES.forEach(issue => {
    // Verificar si ya existe un issue similar
    const exists = existingIssues.some(existing =>
      existing.title.toLowerCase().includes(issue.title.toLowerCase().substring(0, 20))
    );

    if (!exists) {
      const url = createIssue(issue);
      if (url) {
        createdIssues.push({
          title: issue.title,
          url,
          labels: issue.labels,
          isEpic: issue.isEpic,
          subtasks: issue.subtasks,
          issue: issue
        });
      }
    } else {
      console.log(`⚠️  Issue similar ya existe: ${issue.title}`);
    }
  });

  // Crear sub-issues para epics
  const epics = createdIssues.filter(issue => issue.isEpic);
  if (epics.length > 0) {
    console.log('\n🏔️  Procesando epics para crear sub-issues...');
    epics.forEach(epicData => {
      createSubIssuesForEpic(epicData.issue, epicData.url);
    });
  }

  // Generar reporte
  generateReport(createdIssues);

  console.log('\n✅ ¡Creación de issues completada!');
  console.log('\n🎯 Próximos pasos:');
  console.log('   1. Ejecutar: node 04-setup-project-views.js');
  console.log('   2. Revisar los issues creados en GitHub');
  console.log('   3. Asignar issues a miembros del equipo');
  console.log('   4. Al completar sub-issues, marcar checkboxes en los epics');
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { CONFIG, runGhCommand, checkPrerequisites };