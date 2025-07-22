#!/usr/bin/env node

/**
 * 02-setup-repository-labels.js
 * 
 * Script para configurar etiquetas (labels) en el repositorio de GitHub
 * 
 * PROPÓSITO:
 * - Crear un sistema consistente de etiquetas para clasificar issues y PRs
 * - Establecer colores semánticos que faciliten la identificación visual
 * - Organizar el trabajo por tipo, prioridad, componente y estado
 * 
 * TIPOS DE ETIQUETAS:
 * - Tipo de trabajo: feature, bug, enhancement, documentation, etc.
 * - Prioridad: priority-high, priority-medium, priority-low
 * - Componente: por área del sistema (auth, db, api, etc.)
 * - Estado: blocked, waiting-review, ready-to-test
 * - Esfuerzo: good-first-issue, epic
 * 
 * COLORES UTILIZADOS:
 * - Rojos: Bugs y problemas críticos
 * - Azules: Features y mejoras
 * - Verdes: Documentación y tareas completadas
 * - Naranjas: Prioridades y warnings
 * - Púrpuras: Componentes del sistema
 * 
 * PREREQUISITOS:
 * - GitHub CLI instalado (gh)
 * - Token de acceso con permisos de repositorio
 * - Repositorio ya creado
 */

const { execSync } = require('child_process');
const { join } = require('path');

// Cargar variables de entorno desde .env
require('dotenv').config({ path: join(__dirname, '.env') });

// Configuración del repositorio
const CONFIG = {
  // Variables cargadas desde .env
  REPO_OWNER: process.env.GITHUB_OWNER,
  REPO_NAME: process.env.REPO_NAME || 'aurora-stack',
  OWNER_TYPE: process.env.GITHUB_OWNER_TYPE || 'user',
  
  // Etiquetas a crear/actualizar
  LABELS: [
    // === TIPOS DE TRABAJO ===
    {
      name: 'type: feature',
      color: '0052cc',
      description: 'Nueva funcionalidad o característica'
    },
    {
      name: 'type: bug',
      color: 'd73a4a',
      description: 'Error o problema que necesita corrección'
    },
    {
      name: 'type: enhancement',
      color: '0e8a16',
      description: 'Mejora a funcionalidad existente'
    },
    {
      name: 'type: documentation',
      color: '006b75',
      description: 'Documentación y guías'
    },
    {
      name: 'type: refactor',
      color: 'fbca04',
      description: 'Refactorización de código sin cambios funcionales'
    },
    {
      name: 'type: test',
      color: '1d76db',
      description: 'Pruebas unitarias, integración o e2e'
    },
    {
      name: 'type: infrastructure',
      color: '5319e7',
      description: 'DevOps, CI/CD, configuración de infraestructura'
    },

    // === PRIORIDADES ===
    {
      name: 'priority: high',
      color: 'b60205',
      description: '🔥 Prioridad alta - Urgente'
    },
    {
      name: 'priority: medium',
      color: 'ff9f1c',
      description: '⚡ Prioridad media - Importante'
    },
    {
      name: 'priority: low',
      color: 'ffdfba',
      description: '📋 Prioridad baja - Cuando sea posible'
    },

    // === COMPONENTES DEL SISTEMA ===
    {
      name: 'component: keycloak',
      color: '8b5cf6',
      description: 'Keycloak, autenticación y autorización'
    },
    {
      name: 'component: database',
      color: '7c3aed',
      description: 'PostgreSQL, modelos de datos, migraciones'
    },
    {
      name: 'component: api',
      color: '6366f1',
      description: 'APIs REST, GraphQL, servicios backend'
    },
    {
      name: 'component: frontend',
      color: '3b82f6',
      description: 'Interfaz de usuario, componentes React/Vue'
    },
    {
      name: 'component: docker',
      color: '0ea5e9',
      description: 'Docker, containerización, orquestación'
    },
    {
      name: 'component: networking',
      color: '06b6d4',
      description: 'Redes, nginx, load balancers'
    },

    // === ESTADOS DE TRABAJO ===
    {
      name: 'status: blocked',
      color: 'e11d48',
      description: '🚫 Bloqueado - No puede continuar'
    },
    {
      name: 'status: waiting-review',
      color: 'f59e0b',
      description: '👀 Esperando revisión de código'
    },
    {
      name: 'status: ready-to-test',
      color: '10b981',
      description: '🧪 Listo para pruebas'
    },
    {
      name: 'status: in-progress',
      color: '3b82f6',
      description: '⚡ En desarrollo activo'
    },

    // === ESFUERZO Y COMPLEJIDAD ===
    {
      name: 'effort: epic',
      color: '6b21a8',
      description: '🏔️ Epic - Tarea grande, dividir en subtareas'
    },
    {
      name: 'effort: good-first-issue',
      color: '22c55e',
      description: '🌱 Buena primera contribución - Para nuevos dev'
    },
    {
      name: 'effort: quick-win',
      color: '84cc16',
      description: '⚡ Victoria rápida - Menos de 2 horas'
    },

    // === ETIQUETAS ESPECIALES ===
    {
      name: 'breaking-change',
      color: 'dc2626',
      description: '💥 Cambio que rompe compatibilidad'
    },
    {
      name: 'security',
      color: 'ef4444',
      description: '🔒 Relacionado con seguridad'
    },
    {
      name: 'performance',
      color: 'f97316',
      description: '🚀 Mejora de rendimiento'
    },
    {
      name: 'dependencies',
      color: '0284c7',
      description: '📦 Actualización de dependencias'
    },
    {
      name: 'question',
      color: 'd946ef',
      description: '❓ Pregunta o discusión'
    },
    {
      name: 'wontfix',
      color: '6b7280',
      description: '🚫 No se va a arreglar'
    },
    {
      name: 'duplicate',
      color: '6b7280',
      description: '👯 Issue duplicado'
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
  
  // Verificar que las variables de entorno estén configuradas
  if (!CONFIG.REPO_OWNER) {
    console.error('❌ GITHUB_OWNER no está configurado en .env');
    console.error('   Copia .env.example a .env y configúralo');
    console.error('   Luego ejecuta: node 00-validate-permissions.js');
    process.exit(1);
  }
  
  console.log(`✅ Configuración cargada: ${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}`);
}

/**
 * Obtiene todas las etiquetas existentes del repositorio
 * @returns {Array} - Lista de etiquetas existentes
 */
function getExistingLabels() {
  console.log('🔍 Obteniendo etiquetas existentes...');
  
  try {
    const command = `gh api repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/labels`;
    const result = JSON.parse(runGhCommand(command));
    
    console.log(`✅ Encontradas ${result.length} etiquetas existentes`);
    return result.map(label => label.name);
  } catch (error) {
    console.warn('⚠️  No se pudieron obtener etiquetas existentes');
    return [];
  }
}

/**
 * Crea o actualiza una etiqueta
 * @param {object} label - Configuración de la etiqueta
 * @param {Array} existingLabels - Etiquetas existentes
 */
function createOrUpdateLabel(label, existingLabels) {
  const exists = existingLabels.includes(label.name);
  
  try {
    if (exists) {
      // Actualizar etiqueta existente
      const command = `gh api --method PATCH repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/labels/${encodeURIComponent(label.name)} -f name="${label.name}" -f color="${label.color}" -f description="${label.description}"`;
      runGhCommand(command);
      console.log(`🔄 Actualizada: ${label.name}`);
    } else {
      // Crear nueva etiqueta
      const command = `gh api --method POST repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/labels -f name="${label.name}" -f color="${label.color}" -f description="${label.description}"`;
      runGhCommand(command);
      console.log(`✅ Creada: ${label.name}`);
    }
  } catch (error) {
    // Si el error es 404 al actualizar, la etiqueta fue eliminada, crear una nueva
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      try {
        console.log(`ℹ️  Etiqueta '${label.name}' no existe, creando nueva...`);
        const command = `gh api --method POST repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/labels -f name="${label.name}" -f color="${label.color}" -f description="${label.description}"`;
        runGhCommand(command);
        console.log(`✅ Creada: ${label.name}`);
      } catch (createError) {
        console.error(`❌ Error creando etiqueta '${label.name}': ${createError.message}`);
      }
    } else {
      console.error(`❌ Error con etiqueta '${label.name}': ${error.message}`);
    }
  }
}

/**
 * Elimina etiquetas por defecto que no necesitamos
 */
function removeDefaultLabels() {
  const defaultLabelsToRemove = [
    'bug',           // La reemplazamos con 'type: bug' 
    'documentation', // La reemplazamos con 'type: documentation'
    'enhancement',   // La reemplazamos con 'type: enhancement'
    'good first issue', // La reemplazamos con 'effort: good-first-issue'
    'help wanted',
    'invalid'
  ];

  // NO eliminamos 'duplicate', 'question', 'wontfix' porque las vamos a redefinir
  const customLabelsToRedefine = ['duplicate', 'question', 'wontfix'];

  console.log('🗑️  Eliminando etiquetas por defecto innecesarias...');

  defaultLabelsToRemove.forEach(labelName => {
    try {
      const command = `gh api --method DELETE repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/labels/${encodeURIComponent(labelName)}`;
      runGhCommand(command);
      console.log(`🗑️  Eliminada: ${labelName}`);
    } catch (error) {
      // No importa si la etiqueta no existe
      console.log(`ℹ️  Etiqueta '${labelName}' no existe o ya fue eliminada`);
    }
  });

  console.log(`ℹ️  Manteniendo ${customLabelsToRedefine.join(', ')} para redefinir con nuevos colores/descripciones`);
}

/**
 * Genera un reporte de las etiquetas creadas
 */
function generateReport() {
  console.log('\n📊 REPORTE DE ETIQUETAS CONFIGURADAS\n');
  
  const categories = [
    { title: '🔧 TIPOS DE TRABAJO', filter: name => name.startsWith('type:') },
    { title: '⭐ PRIORIDADES', filter: name => name.startsWith('priority:') },
    { title: '🏗️ COMPONENTES', filter: name => name.startsWith('component:') },
    { title: '📋 ESTADOS', filter: name => name.startsWith('status:') },
    { title: '💪 ESFUERZO', filter: name => name.startsWith('effort:') },
    { title: '🎯 ESPECIALES', filter: name => !name.includes(':') }
  ];

  categories.forEach(category => {
    console.log(category.title);
    const labels = CONFIG.LABELS.filter(label => category.filter(label.name));
    labels.forEach(label => {
      console.log(`   ${label.name} - ${label.description}`);
    });
    console.log('');
  });
}

/**
 * Función principal
 */
function main() {
  console.log('🏷️  Iniciando configuración de etiquetas para GitHub Repository');
  console.log(`📁 Repositorio: ${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}\n`);
  
  // Verificar prerequisitos
  checkPrerequisites();
  
  // Eliminar etiquetas por defecto PRIMERO
  removeDefaultLabels();
  
  // Obtener etiquetas existentes DESPUÉS de eliminar las por defecto
  const existingLabels = getExistingLabels();
  
  // Crear/actualizar etiquetas
  console.log('\n🏷️  Configurando etiquetas personalizadas...');
  CONFIG.LABELS.forEach(label => {
    createOrUpdateLabel(label, existingLabels);
  });
  
  // Generar reporte
  generateReport();
  
  console.log('✅ ¡Configuración de etiquetas completada!');
  console.log('\n🎯 Próximos pasos:');
  console.log('   1. Ejecutar: node 03-create-sample-issues.js');
  console.log('   2. Usar las etiquetas al crear issues y PRs');
  console.log('   3. Configurar plantillas de issues con etiquetas predeterminadas');
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { CONFIG, runGhCommand, checkPrerequisites };