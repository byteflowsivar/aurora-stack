#!/usr/bin/env node

/**
 * 01-setup-project-fields.js
 * 
 * Script para configurar campos personalizados en GitHub Projects
 * 
 * PROPÓSITO:
 * - Crear campos personalizados para tracking de tiempo y estimaciones
 * - Configurar campos para priorización y categorización de tareas
 * - Establecer campos para gestión de costos del proyecto
 * 
 * CAMPOS QUE CREA:
 * - Estimation (Number): Horas estimadas para completar la tarea
 * - Priority (Select): Nivel de prioridad (High, Medium, Low)
 * - Epic (Text): Para agrupar tareas relacionadas
 * - Component (Select): Área del sistema afectada
 * - Story Points (Number): Puntos de historia para estimación ágil
 * - Actual Hours (Number): Horas reales trabajadas
 * - Cost Estimate (Number): Costo estimado en USD
 * - Quarter (Select): Planificación temporal por trimestre
 * 
 * PREREQUISITOS:
 * - Ejecutar primero: node 00-validate-permissions.js
 * - GitHub CLI instalado (gh)
 * - Token de acceso con permisos de proyecto
 * - Proyecto de GitHub ya creado
 */

const { execSync } = require('child_process');
const { join } = require('path');

// Cargar variables de entorno desde .env
require('dotenv').config({ path: join(__dirname, '.env') });

// Configuración del proyecto
const CONFIG = {
  // Variables cargadas desde .env
  PROJECT_OWNER: process.env.GITHUB_OWNER,
  PROJECT_NUMBER: process.env.PROJECT_NUMBER || '1',
  OWNER_TYPE: process.env.GITHUB_OWNER_TYPE || 'user',
  HOURLY_RATE: parseFloat(process.env.HOURLY_RATE || '50'),

  // Campos personalizados a crear
  CUSTOM_FIELDS: [
    {
      name: 'Estimation',
      type: 'number',
      description: 'Horas estimadas para completar la tarea'
    },
    {
      name: 'Priority',
      type: 'single_select',
      description: 'Nivel de prioridad de la tarea',
      options: [
        { name: 'High', description: 'Prioridad alta - Crítico', color: 'RED' },
        { name: 'Medium', description: 'Prioridad media - Importante', color: 'YELLOW' },
        { name: 'Low', description: 'Prioridad baja - Nice to have', color: 'GREEN' }
      ]
    },
    {
      name: 'Epic',
      type: 'text',
      description: 'Epic o tema principal al que pertenece la tarea'
    },
    {
      name: 'Component',
      type: 'single_select',
      description: 'Componente o área del sistema',
      options: [
        { name: 'Infrastructure', description: 'Infraestructura y DevOps', color: 'PURPLE' },
        { name: 'Authentication', description: 'Keycloak y autenticación', color: 'BLUE' },
        { name: 'Database', description: 'Base de datos y modelos', color: 'PINK' },
        { name: 'API', description: 'Desarrollo de APIs', color: 'ORANGE' },
        { name: 'Frontend', description: 'Interfaz de usuario', color: 'GREEN' },
        { name: 'Testing', description: 'Pruebas y QA', color: 'YELLOW' },
        { name: 'Documentation', description: 'Documentación', color: 'GRAY' },
        { name: 'Deployment', description: 'Despliegue y operaciones', color: 'RED' }
      ]
    },
    {
      name: 'Story Points',
      type: 'number',
      description: 'Puntos de historia para estimación ágil (Fibonacci: 1,2,3,5,8,13)'
    },
    {
      name: 'Actual Hours',
      type: 'number',
      description: 'Horas reales trabajadas en la tarea'
    },
    {
      name: 'Cost Estimate',
      type: 'number',
      description: 'Costo estimado en USD (Estimation × Tarifa Horaria)'
    },
    {
      name: 'Quarter',
      type: 'single_select',
      description: 'Trimestre de planificación',
      options: [
        { name: 'Q1 2025', description: 'Enero - Marzo 2025', color: 'BLUE' },
        { name: 'Q2 2025', description: 'Abril - Junio 2025', color: 'GREEN' },
        { name: 'Q3 2025', description: 'Julio - Septiembre 2025', color: 'ORANGE' },
        { name: 'Q4 2025', description: 'Octubre - Diciembre 2025', color: 'PURPLE' }
      ]
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
    process.exit(1);
  }
}

/**
 * Verifica prerequisitos y configuración
 */
function checkPrerequisites() {
  console.log('🔍 Verificando prerequisitos...');
  
  // Verificar que las variables de entorno estén configuradas
  if (!CONFIG.PROJECT_OWNER) {
    console.error('❌ GITHUB_OWNER no está configurado en .env');
    console.error('   Copia .env.example a .env y configúralo');
    console.error('   Luego ejecuta: node 00-validate-permissions.js');
    process.exit(1);
  }
  
  console.log(`✅ Configuración cargada: ${CONFIG.PROJECT_OWNER}/${CONFIG.PROJECT_NUMBER}`);
  console.log(`✅ Tarifa por hora: $${CONFIG.HOURLY_RATE}`);
}

/**
 * Obtiene información completa del proyecto incluyendo campos existentes
 * @returns {object} - Información del proyecto con campos
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
              ... on ProjectV2IterationField {
                id
                name
                dataType
              }
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
    
    console.log(`✅ Proyecto encontrado: ${project.title || 'Sin título'}`);
    console.log(`   Campos existentes: ${project.fields.nodes.length}`);
    
    return project;
  } catch (error) {
    console.error('❌ No se pudo obtener información del proyecto.');
    console.error(`   Verifica GITHUB_OWNER=${CONFIG.PROJECT_OWNER}`);
    console.error(`   Verifica PROJECT_NUMBER=${CONFIG.PROJECT_NUMBER}`);
    console.error(`   Verifica GITHUB_OWNER_TYPE=${CONFIG.OWNER_TYPE}`);
    process.exit(1);
  }
}

/**
 * Obtiene el ID del proyecto (función simplificada)
 * @returns {string} - ID del proyecto
 */
function getProjectId() {
  console.log(`🔍 Obteniendo ID del proyecto ${CONFIG.PROJECT_NUMBER}...`);

  // Query dinámico según el tipo de owner
  const ownerField = CONFIG.OWNER_TYPE === 'org' ? 'organization' : 'user';
  const query = `
    query($owner: String!, $number: Int!) {
      ${ownerField}(login: $owner) {
        projectV2(number: $number) {
          id
        }
      }
    }`;

  const command = `gh api graphql -f query='${query}' -f owner="${CONFIG.PROJECT_OWNER}" -F number=${CONFIG.PROJECT_NUMBER}`;

  try {
    const result = JSON.parse(runGhCommand(command));
    const projectId = result.data[ownerField]?.projectV2?.id;
    
    if (!projectId) {
      throw new Error('Proyecto no encontrado');
    }
    
    console.log(`✅ Proyecto encontrado: ${projectId}`);
    return projectId;
  } catch (error) {
    console.error('❌ No se pudo encontrar el proyecto.');
    console.error(`   Verifica GITHUB_OWNER=${CONFIG.PROJECT_OWNER}`);
    console.error(`   Verifica PROJECT_NUMBER=${CONFIG.PROJECT_NUMBER}`);
    console.error(`   Verifica GITHUB_OWNER_TYPE=${CONFIG.OWNER_TYPE}`);
    process.exit(1);
  }
}

/**
 * Verifica si un campo ya existe en el proyecto
 * @param {Array} existingFields - Campos existentes en el proyecto
 * @param {string} fieldName - Nombre del campo a verificar
 * @returns {object|null} - Campo existente o null
 */
function findExistingField(existingFields, fieldName) {
  return existingFields.find(field => field.name === fieldName) || null;
}

/**
 * Crea un campo personalizado en el proyecto
 * @param {string} projectId - ID del proyecto
 * @param {object} field - Configuración del campo
 * @param {Array} existingFields - Campos existentes en el proyecto
 */
function createCustomField(projectId, field, existingFields) {
  // Verificar si el campo ya existe
  const existingField = findExistingField(existingFields, field.name);
  if (existingField) {
    console.log(`⏭️  Campo '${field.name}' ya existe - omitiendo`);
    console.log(`   ID: ${existingField.id}, Tipo: ${existingField.dataType}`);
    return;
  }

  console.log(`📝 Creando campo: ${field.name} (${field.type})`);

  let variables = `projectId: "${projectId}", name: "${field.name}", dataType: ${field.type.toUpperCase()}`;

  if (field.options) {
    const options = field.options.map(opt => 
      `{name: "${opt.name}", description: "${opt.description}", color: ${opt.color}}`
    ).join(', ');
    variables += `, singleSelectOptions: [${options}]`;
  }

  // Mutation corregida con fragments para manejar la union ProjectV2Field
  const mutation = `
    mutation {
      createProjectV2Field(input: {${variables}}) {
        projectV2Field {
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
          ... on ProjectV2IterationField {
            id
            name
            dataType
          }
        }
      }
    }`;

  try {
    const result = JSON.parse(runGhCommand(`gh api graphql -f query='${mutation}'`));

    if (result.errors) {
      console.warn(`⚠️  Error creando ${field.name}: ${result.errors[0].message}`);
      // Mostrar detalles del error para debugging
      if (result.errors[0].extensions) {
        console.warn(`   Detalles: ${JSON.stringify(result.errors[0].extensions)}`);
      }
    } else if (result.data && result.data.createProjectV2Field) {
      const createdField = result.data.createProjectV2Field.projectV2Field;
      console.log(`✅ Campo creado: ${createdField.name} (ID: ${createdField.id})`);
    } else {
      console.warn(`⚠️  Respuesta inesperada al crear ${field.name}`);
    }
  } catch (error) {
    console.warn(`⚠️  Error creando campo ${field.name}: ${error.message}`);
    
    // Si es un error de parsing JSON, mostrar la respuesta cruda
    if (error.message.includes('JSON')) {
      console.warn('   Ejecuta manualmente para ver la respuesta completa:');
      console.warn(`   gh api graphql -f query='${mutation.replace(/\n\s+/g, ' ')}'`);
    }
  }
}

/**
 * Función principal
 */
function main() {
  console.log('🚀 Iniciando configuración de campos personalizados para GitHub Project');
  console.log(`📊 Proyecto: ${CONFIG.PROJECT_OWNER}/${CONFIG.PROJECT_NUMBER}\n`);

  // Verificar prerequisitos
  checkPrerequisites();

  // Obtener información completa del proyecto
  const projectInfo = getProjectInfo();
  const projectId = projectInfo.id;
  const existingFields = projectInfo.fields.nodes;

  // Mostrar campos existentes
  if (existingFields.length > 0) {
    console.log('\n📋 Campos existentes en el proyecto:');
    existingFields.forEach(field => {
      console.log(`   • ${field.name} (${field.dataType})`);
    });
  }

  // Crear campos personalizados
  console.log('\n📝 Configurando campos personalizados...');
  let createdCount = 0;
  let skippedCount = 0;

  CONFIG.CUSTOM_FIELDS.forEach(field => {
    const existingField = findExistingField(existingFields, field.name);
    if (existingField) {
      skippedCount++;
    } else {
      createCustomField(projectId, field, existingFields);
      createdCount++;
    }
  });

  // Resumen final
  console.log('\n✅ ¡Configuración de campos completada!');
  console.log(`   • Campos creados: ${createdCount}`);
  console.log(`   • Campos existentes omitidos: ${skippedCount}`);
  console.log(`   • Total campos configurados: ${CONFIG.CUSTOM_FIELDS.length}`);

  if (createdCount > 0) {
    console.log('\n📋 Nuevos campos creados:');
    CONFIG.CUSTOM_FIELDS.forEach(field => {
      const exists = findExistingField(existingFields, field.name);
      if (!exists) {
        console.log(`   • ${field.name} (${field.type}): ${field.description}`);
      }
    });
  }

  console.log('\n🎯 Próximos pasos:');
  console.log('   1. Ejecutar: node 02-setup-repository-labels.js');
  console.log('   2. Ejecutar: node 03-create-sample-issues.js');
  console.log('   3. Ejecutar: node 04-setup-project-views.js');
  console.log('   4. Configurar las vistas del proyecto manualmente');
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { CONFIG, runGhCommand, checkPrerequisites };