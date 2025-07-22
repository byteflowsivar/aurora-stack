#!/usr/bin/env node

/**
 * 04-setup-project-views.js
 * 
 * Script para configurar vistas personalizadas en GitHub Projects
 * 
 * PROPÓSITO:
 * - Crear vistas optimizadas para diferentes workflows del proyecto
 * - Configurar filtros y agrupaciones específicas para Aurora Stack
 * - Establecer vistas para tracking de tiempo y costos
 * - Optimizar la visualización del roadmap del proyecto
 * 
 * VISTAS QUE CONFIGURA:
 * 1. 📋 Roadmap - Vista temporal para planificación
 * 2. 🏃 Sprint Board - Kanban para desarrollo activo
 * 3. 📊 Metrics Dashboard - Vista de métricas y estimaciones
 * 4. 🏗️ By Component - Agrupado por componente del sistema
 * 5. ⚡ Priority Queue - Ordenado por prioridad
 * 6. 👥 Team View - Vista por assignee/responsable
 * 
 * LIMITACIONES DE LA API:
 * Nota: La API GraphQL de GitHub Projects v2 tiene limitaciones para crear
 * vistas automáticamente. Este script proporciona las queries necesarias
 * y guías para configuración manual.
 * 
 * PREREQUISITOS:
 * - Scripts anteriores ejecutados (01, 02, 03)
 * - GitHub CLI instalado y autenticado
 * - Proyecto de GitHub creado con campos personalizados
 */

const { execSync } = require('child_process');
const { join } = require('path');

// Cargar variables de entorno desde .env
require('dotenv').config({ path: join(__dirname, '.env') });

// Configuración del proyecto
const CONFIG = {
  PROJECT_OWNER: process.env.GITHUB_OWNER,
  PROJECT_NUMBER: process.env.PROJECT_NUMBER || '1',
  OWNER_TYPE: process.env.GITHUB_OWNER_TYPE || 'user',
  
  // Configuración de vistas (para referencia y documentación)
  PROJECT_VIEWS: [
    {
      name: '📋 Roadmap',
      type: 'roadmap',
      description: 'Vista temporal para planificación de roadmap',
      layout: 'BOARD_LAYOUT',
      configuration: {
        groupBy: 'Quarter',
        sortBy: 'Priority',
        filters: {
          state: ['OPEN'],
          labels: ['effort: epic', 'type: feature']
        },
        fields: ['Estimation', 'Cost Estimate', 'Component', 'Quarter']
      }
    },
    {
      name: '🏃 Sprint Board',
      type: 'board',
      description: 'Kanban board para desarrollo activo',
      layout: 'BOARD_LAYOUT',
      configuration: {
        groupBy: 'Status',
        sortBy: 'Priority',
        filters: {
          state: ['OPEN'],
          quarter: ['Q1 2025', 'Q2 2025']
        },
        fields: ['Estimation', 'Actual Hours', 'Component', 'Priority']
      }
    },
    {
      name: '📊 Metrics Dashboard',
      type: 'table',
      description: 'Vista de métricas y estimaciones para costos',
      layout: 'TABLE_LAYOUT',
      configuration: {
        groupBy: 'Component',
        sortBy: 'Cost Estimate',
        filters: {
          state: ['OPEN', 'CLOSED']
        },
        fields: [
          'Title', 'Story Points', 'Estimation', 'Actual Hours', 
          'Cost Estimate', 'Component', 'Priority', 'Status'
        ]
      }
    },
    {
      name: '🏗️ By Component',
      type: 'board',
      description: 'Vista agrupada por componente del sistema',
      layout: 'BOARD_LAYOUT',
      configuration: {
        groupBy: 'Component',
        sortBy: 'Priority',
        filters: {
          state: ['OPEN']
        },
        fields: ['Estimation', 'Priority', 'Status', 'Epic']
      }
    },
    {
      name: '⚡ Priority Queue',
      type: 'table',
      description: 'Cola de prioridades para planificación',
      layout: 'TABLE_LAYOUT',
      configuration: {
        groupBy: 'Priority',
        sortBy: 'Estimation',
        filters: {
          state: ['OPEN'],
          priority: ['priority: high', 'priority: medium']
        },
        fields: ['Title', 'Priority', 'Estimation', 'Component', 'Status']
      }
    },
    {
      name: '👥 Team View',
      type: 'board',
      description: 'Vista por responsable/assignee',
      layout: 'BOARD_LAYOUT',
      configuration: {
        groupBy: 'Assignees',
        sortBy: 'Priority',
        filters: {
          state: ['OPEN']
        },
        fields: ['Estimation', 'Priority', 'Component', 'Status']
      }
    }
  ]
};

/**
 * Ejecuta un comando de GitHub CLI
 * @param {string} command - Comando a ejecutar
 * @returns {string} - Salida del comando
 */
function runGhCommand(command) {
  try {
    const result = execSync(command, { encoding: 'utf-8' });
    return result.trim();
  } catch (error) {
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
 * Obtiene información del proyecto
 * @returns {object} - Información del proyecto
 */
function getProjectInfo() {
  console.log(`🔍 Obteniendo información del proyecto ${CONFIG.PROJECT_NUMBER}...`);
  
  // Query dinámico según el tipo de owner
  const ownerField = CONFIG.OWNER_TYPE === 'org' ? 'organization' : 'user';
  const query = `
    query($owner: String!, $number: Int!) {
      ${ownerField}(login: $owner) {
        projectV2(number: $number) {
          id
          title
          shortDescription
          fields(first: 50) {
            nodes {
              ... on ProjectV2Field {
                id
                name
                dataType
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                dataType
                options {
                  id
                  name
                }
              }
            }
          }
          views(first: 20) {
            nodes {
              id
              name
              layout
            }
          }
        }
      }
    }`;
  
  const command = `gh api graphql -f query='${query}' -f owner="${CONFIG.PROJECT_OWNER}" -F number=${CONFIG.PROJECT_NUMBER}`;
  
  try {
    const result = JSON.parse(runGhCommand(command));
    const project = result.data[ownerField]?.projectV2;
    
    if (!project) {
      throw new Error('Proyecto no encontrado');
    }
    
    console.log(`✅ Proyecto encontrado: ${project.title}`);
    console.log(`   Tipo: ${CONFIG.OWNER_TYPE === 'org' ? 'Organización' : 'Usuario'}`);
    console.log(`   ID: ${project.id}`);
    console.log(`   Campos: ${project.fields.nodes.length}`);
    console.log(`   Vistas existentes: ${project.views.nodes.length}`);
    
    return project;
    
  } catch (error) {
    console.error('❌ Error obteniendo información del proyecto');
    console.error(`   Verifica GITHUB_OWNER=${CONFIG.PROJECT_OWNER}`);
    console.error(`   Verifica PROJECT_NUMBER=${CONFIG.PROJECT_NUMBER}`);
    console.error(`   Verifica GITHUB_OWNER_TYPE=${CONFIG.OWNER_TYPE}`);
    throw error;
  }
}

/**
 * Genera documentación para configuración manual de vistas
 * @param {object} projectInfo - Información del proyecto
 */
function generateViewConfiguration(projectInfo) {
  console.log('\n📚 GENERANDO GUÍA DE CONFIGURACIÓN DE VISTAS\n');
  
  const fields = projectInfo.fields.nodes.map(field => ({
    name: field.name,
    id: field.id,
    type: field.dataType,
    options: field.options || []
  }));

  console.log('🔧 CAMPOS DISPONIBLES:');
  fields.forEach(field => {
    console.log(`   • ${field.name} (${field.type})`);
    if (field.options.length > 0) {
      field.options.forEach(option => {
        console.log(`     - ${option.name}`);
      });
    }
  });

  console.log('\n📋 CONFIGURACIÓN DE VISTAS RECOMENDADAS:\n');

  CONFIG.PROJECT_VIEWS.forEach((view, index) => {
    console.log(`${index + 1}. ${view.name}`);
    console.log(`   Tipo: ${view.type}`);
    console.log(`   Descripción: ${view.description}`);
    console.log(`   Layout: ${view.layout}`);
    console.log('   Configuración:');
    console.log(`     • Agrupar por: ${view.configuration.groupBy}`);
    console.log(`     • Ordenar por: ${view.configuration.sortBy}`);
    
    if (view.configuration.filters) {
      console.log('     • Filtros:');
      Object.entries(view.configuration.filters).forEach(([key, values]) => {
        console.log(`       - ${key}: ${Array.isArray(values) ? values.join(', ') : values}`);
      });
    }
    
    console.log(`     • Campos visibles: ${view.configuration.fields.join(', ')}`);
    console.log('');
  });
}

/**
 * Genera scripts de ejemplo para automatización futura
 */
function generateAutomationScripts() {
  console.log('🤖 GENERANDO SCRIPTS DE AUTOMATIZACIÓN\n');

  // Script de ejemplo para crear una vista programáticamente
  const exampleScript = `
// Ejemplo de mutation GraphQL para crear vista (requiere desarrollo adicional)
const createViewMutation = \`
  mutation CreateView($projectId: ID!, $input: ProjectV2ViewCreateInput!) {
    createProjectV2View(input: {
      projectId: $projectId,
      name: $input.name,
      layout: $input.layout
    }) {
      view {
        id
        name
      }
    }
  }
\`;

// Nota: La API de GitHub Projects v2 está en beta y puede cambiar
// Se recomienda configurar las vistas manualmente por ahora`;

  console.log(exampleScript);
}

/**
 * Crea plantillas de issues para diferentes vistas
 */
function createIssueTemplates() {
  console.log('📝 CREANDO PLANTILLAS DE ISSUES\n');

  const templates = [
    {
      name: 'epic_template.md',
      content: `---
name: 🏔️ Epic
about: Template para crear epics (tareas grandes)
title: '[EPIC] '
labels: 'effort: epic, priority: medium'
assignees: ''
---

## Descripción
Describe el epic y su propósito general.

## Objetivos
- [ ] Objetivo 1
- [ ] Objetivo 2
- [ ] Objetivo 3

## Criterios de Aceptación
- Criterio 1
- Criterio 2

## Estimación
- **Story Points**: 
- **Horas Estimadas**: 
- **Costo Estimado**: $

## Dependencias
- Epic/Issue dependencies

## Tareas Relacionadas
Lista de issues/tasks que forman parte de este epic.`
    },
    {
      name: 'feature_template.md',
      content: `---
name: ✨ Feature
about: Template para nuevas funcionalidades
title: ''
labels: 'type: feature, priority: medium'
assignees: ''
---

## Descripción
Describe la nueva funcionalidad.

## Tareas
- [ ] Tarea 1
- [ ] Tarea 2

## Criterios de Aceptación
- Criterio 1
- Criterio 2

## Estimación
- **Story Points**: 
- **Horas Estimadas**: 
- **Costo Estimado**: $

## Referencias Técnicas
- Links a documentación relevante`
    },
    {
      name: 'bug_template.md',
      content: `---
name: 🐛 Bug Report
about: Template para reportar bugs
title: ''
labels: 'type: bug, priority: medium'
assignees: ''
---

## Descripción del Bug
Descripción clara del problema.

## Pasos para Reproducir
1. Paso 1
2. Paso 2
3. Ver error

## Comportamiento Actual
Qué está pasando actualmente.

## Comportamiento Esperado
Qué debería pasar.

## Estimación
- **Story Points**: 
- **Horas Estimadas**: 
- **Costo Estimado**: $`
    }
  ];

  console.log('Plantillas generadas:');
  templates.forEach(template => {
    console.log(`   • ${template.name}`);
  });

  return templates;
}

/**
 * Función principal
 */
function main() {
  console.log('🎨 Iniciando configuración de vistas para GitHub Project');
  console.log(`📊 Proyecto: ${CONFIG.PROJECT_OWNER}/${CONFIG.PROJECT_NUMBER}\n`);
  
  try {
    // Verificar prerequisitos
    checkPrerequisites();
    
    // Obtener información del proyecto
    const projectInfo = getProjectInfo();
    
    // Generar documentación de vistas
    generateViewConfiguration(projectInfo);
    
    // Generar scripts de automatización
    generateAutomationScripts();
    
    // Crear plantillas de issues
    const templates = createIssueTemplates();
    
    console.log('\n✅ ¡Configuración de vistas completada!');
    console.log('\n📋 PASOS MANUALES REQUERIDOS:');
    console.log('   1. Ve a tu proyecto en GitHub: https://github.com/users/' + CONFIG.PROJECT_OWNER + '/projects/' + CONFIG.PROJECT_NUMBER);
    console.log('   2. Haz clic en "New view" para cada vista recomendada');
    console.log('   3. Usa la configuración detallada arriba para cada vista');
    console.log('   4. Configura los filtros y campos según las especificaciones');
    console.log('   5. Guarda cada vista con el nombre correspondiente');
    
    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Configurar las vistas manualmente en GitHub');
    console.log('   2. Asignar issues a las vistas apropiadas');
    console.log('   3. Comenzar a usar el roadmap para planificación');
    console.log('   4. Configurar automatizaciones con GitHub Actions si es necesario');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { CONFIG, runGhCommand, checkPrerequisites };