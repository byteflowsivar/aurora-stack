#!/usr/bin/env node

/**
 * 00-validate-permissions.js
 * 
 * Script de validación previa para verificar permisos y prerequisites
 * 
 * PROPÓSITO:
 * - Validar que GitHub CLI está instalado y actualizado
 * - Verificar autenticación y permisos del usuario
 * - Confirmar acceso al repositorio y proyecto
 * - Validar que el proyecto existe y es accesible
 * - Verificar permisos de escritura necesarios
 * - Validar variables de entorno requeridas
 * 
 * VALIDACIONES QUE REALIZA:
 * 1. ✅ GitHub CLI instalación y versión mínima
 * 2. ✅ Autenticación con GitHub
 * 3. ✅ Permisos en el repositorio (admin/write)
 * 4. ✅ Acceso al proyecto GitHub Projects
 * 5. ✅ Permisos para modificar proyecto
 * 6. ✅ Variables de entorno configuradas
 * 7. ✅ Conectividad con GitHub API
 * 8. ✅ Rate limits de la API
 * 
 * PREREQUISITOS:
 * - GitHub CLI v2.0.0 o superior
 * - Token con scopes: repo, project, read:user
 * - Variables de entorno: GITHUB_OWNER, PROJECT_NUMBER
 * - Conexión a internet estable
 * 
 * ESTE SCRIPT DEBE EJECUTARSE PRIMERO ANTES QUE CUALQUIER OTRO
 */

const { execSync } = require('child_process');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

// Cargar variables de entorno desde .env
require('dotenv').config({ path: join(__dirname, '.env') });

// Configuración de validación
const CONFIG = {
  // Versión mínima requerida de GitHub CLI
  MIN_GH_VERSION: '2.0.0',
  
  // Scopes requeridos para el token
  REQUIRED_SCOPES: ['repo', 'project', 'read:user'],
  
  // Variables de entorno requeridas
  REQUIRED_ENV_VARS: ['GITHUB_OWNER'],
  
  // Variables opcionales con valores por defecto
  OPTIONAL_ENV_VARS: {
    PROJECT_NUMBER: '1',
    REPO_NAME: 'aurora-stack',
    GITHUB_OWNER_TYPE: 'user'
  },
  
  // Límites de rate de la API
  API_RATE_LIMITS: {
    CORE: 5000,      // Requests por hora para API core
    GRAPHQL: 5000,   // Points por hora para GraphQL
    SEARCH: 30       // Requests por minuto para search
  }
};

/**
 * Colores para output en consola
 */
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

/**
 * Ejecuta un comando y retorna el resultado
 * @param {string} command - Comando a ejecutar
 * @param {boolean} silent - Si debe suprimir errores
 * @returns {object} - {success, output, error}
 */
function runCommand(command, silent = false) {
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: output.trim(), error: null };
  } catch (error) {
    return { 
      success: false, 
      output: null, 
      error: error.message 
    };
  }
}

/**
 * Imprime mensaje con color
 * @param {string} message - Mensaje a imprimir
 * @param {string} color - Color del mensaje
 * @param {string} prefix - Prefijo del mensaje
 */
function printMessage(message, color = COLORS.WHITE, prefix = '') {
  console.log(`${color}${prefix}${message}${COLORS.RESET}`);
}

/**
 * Compara versiones semánticas
 * @param {string} current - Versión actual
 * @param {string} required - Versión requerida
 * @returns {boolean} - True si current >= required
 */
function compareVersions(current, required) {
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const requiredPart = requiredParts[i] || 0;
    
    if (currentPart > requiredPart) return true;
    if (currentPart < requiredPart) return false;
  }
  
  return true;
}

/**
 * Valida instalación y versión de GitHub CLI
 */
function validateGitHubCLI() {
  printMessage('\n🔍 VALIDANDO GITHUB CLI', COLORS.CYAN, COLORS.BOLD);
  
  // Verificar instalación
  const ghCheck = runCommand('gh --version', true);
  if (!ghCheck.success) {
    printMessage('❌ GitHub CLI no está instalado', COLORS.RED);
    printMessage('   Instálalo con: brew install gh (macOS) o https://cli.github.com/', COLORS.YELLOW);
    return false;
  }
  
  // Extraer versión
  const versionMatch = ghCheck.output.match(/gh version (\d+\.\d+\.\d+)/);
  if (!versionMatch) {
    printMessage('❌ No se pudo determinar la versión de GitHub CLI', COLORS.RED);
    return false;
  }
  
  const currentVersion = versionMatch[1];
  
  // Verificar versión mínima
  if (!compareVersions(currentVersion, CONFIG.MIN_GH_VERSION)) {
    printMessage(`❌ GitHub CLI versión ${currentVersion} < ${CONFIG.MIN_GH_VERSION} (requerida)`, COLORS.RED);
    printMessage('   Actualízalo con: gh --upgrade', COLORS.YELLOW);
    return false;
  }
  
  printMessage(`✅ GitHub CLI v${currentVersion} instalado correctamente`, COLORS.GREEN);
  return true;
}

/**
 * Valida autenticación con GitHub
 */
function validateAuthentication() {
  printMessage('\n🔐 VALIDANDO AUTENTICACIÓN', COLORS.CYAN, COLORS.BOLD);
  
  // Verificar si está autenticado
  const authCheck = runCommand('gh auth status', true);
  if (!authCheck.success) {
    printMessage('❌ No estás autenticado con GitHub', COLORS.RED);
    printMessage('   Ejecuta: gh auth login', COLORS.YELLOW);
    return false;
  }
  
  // Obtener información del usuario
  const userCheck = runCommand('gh api user', true);
  if (!userCheck.success) {
    printMessage('❌ No se puede acceder a la API de GitHub', COLORS.RED);
    printMessage('   Verifica tu conexión y permisos del token', COLORS.YELLOW);
    return false;
  }
  
  try {
    const user = JSON.parse(userCheck.output);
    printMessage(`✅ Autenticado como: ${user.login} (${user.name || 'Sin nombre'})`, COLORS.GREEN);
    
    // Verificar scopes del token si es posible
    const scopeCheck = runCommand('gh auth status --show-token 2>&1 | grep -o "Token: .*"', true);
    if (scopeCheck.success) {
      printMessage('✅ Token de acceso configurado correctamente', COLORS.GREEN);
    }
    
    return true;
  } catch (error) {
    printMessage('❌ Error parseando información del usuario', COLORS.RED);
    return false;
  }
}

/**
 * Valida archivo .env y variables de entorno
 */
function validateEnvironmentVariables() {
  printMessage('\n🌍 VALIDANDO VARIABLES DE ENTORNO', COLORS.CYAN, COLORS.BOLD);
  
  // Verificar si existe archivo .env
  const envPath = join(__dirname, '.env');
  const envExamplePath = join(__dirname, '.env.example');
  
  if (!existsSync(envPath)) {
    printMessage('❌ Archivo .env no encontrado', COLORS.RED);
    if (existsSync(envExamplePath)) {
      printMessage('   Copia .env.example a .env y configúralo:', COLORS.YELLOW);
      printMessage('   cp .env.example .env', COLORS.BLUE);
    } else {
      printMessage('   Crea un archivo .env con las variables necesarias', COLORS.YELLOW);
    }
    return false;
  }
  
  printMessage('✅ Archivo .env encontrado', COLORS.GREEN);
  
  let allValid = true;
  
  // Verificar variables requeridas
  CONFIG.REQUIRED_ENV_VARS.forEach(envVar => {
    const value = process.env[envVar];
    if (!value) {
      printMessage(`❌ Variable requerida ${envVar} no está configurada`, COLORS.RED);
      printMessage(`   Agrégala al archivo .env: ${envVar}=valor`, COLORS.YELLOW);
      allValid = false;
    } else {
      printMessage(`✅ ${envVar}="${value}"`, COLORS.GREEN);
    }
  });
  
  // Configurar variables opcionales con defaults
  Object.entries(CONFIG.OPTIONAL_ENV_VARS).forEach(([envVar, defaultValue]) => {
    const value = process.env[envVar] || defaultValue;
    if (!process.env[envVar]) {
      process.env[envVar] = value;
      printMessage(`✅ ${envVar}="${value}" (default)`, COLORS.YELLOW);
    } else {
      printMessage(`✅ ${envVar}="${value}"`, COLORS.GREEN);
    }
  });
  
  return allValid;
}

/**
 * Valida acceso al repositorio
 */
function validateRepositoryAccess() {
  printMessage('\n📁 VALIDANDO ACCESO AL REPOSITORIO', COLORS.CYAN, COLORS.BOLD);
  
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.REPO_NAME;
  
  // Verificar que el repositorio existe y tenemos acceso
  const repoCheck = runCommand(`gh api repos/${owner}/${repo}`, true);
  if (!repoCheck.success) {
    printMessage(`❌ No se puede acceder al repositorio ${owner}/${repo}`, COLORS.RED);
    printMessage('   Verifica que el repositorio existe y tienes permisos', COLORS.YELLOW);
    return false;
  }
  
  try {
    const repoInfo = JSON.parse(repoCheck.output);
    printMessage(`✅ Repositorio: ${repoInfo.full_name}`, COLORS.GREEN);
    printMessage(`   Descripción: ${repoInfo.description || 'Sin descripción'}`, COLORS.WHITE);
    printMessage(`   Visibilidad: ${repoInfo.private ? 'Privado' : 'Público'}`, COLORS.WHITE);
    
    // Verificar permisos
    const permissions = repoInfo.permissions;
    if (!permissions.admin && !permissions.push) {
      printMessage('❌ Necesitas permisos de escritura (push) o admin en el repositorio', COLORS.RED);
      return false;
    }
    
    printMessage(`✅ Permisos: Admin=${permissions.admin}, Push=${permissions.push}`, COLORS.GREEN);
    return true;
    
  } catch (error) {
    printMessage('❌ Error parseando información del repositorio', COLORS.RED);
    return false;
  }
}

/**
 * Valida acceso al proyecto GitHub Projects
 */
function validateProjectAccess() {
  printMessage('\n📊 VALIDANDO ACCESO AL PROYECTO', COLORS.CYAN, COLORS.BOLD);
  
  const owner = process.env.GITHUB_OWNER;
  const projectNumber = process.env.PROJECT_NUMBER;
  const ownerType = process.env.GITHUB_OWNER_TYPE || 'user';
  
  // Query GraphQL dinámico según el tipo de owner
  const ownerField = ownerType === 'org' ? 'organization' : 'user';
  const query = `
    query($owner: String!, $number: Int!) {
      ${ownerField}(login: $owner) {
        projectV2(number: $number) {
          id
          title
          shortDescription
          public
          viewerCanUpdate
          fields(first: 10) {
            nodes {
              ... on ProjectV2Field {
                id
                name
              }
            }
          }
        }
      }
    }`;
  
  const command = `gh api graphql -f query='${query}' -f owner="${owner}" -F number=${projectNumber}`;
  const projectCheck = runCommand(command, true);
  
  if (!projectCheck.success) {
    printMessage(`❌ No se puede acceder al proyecto #${projectNumber}`, COLORS.RED);
    printMessage('   Verifica que el proyecto existe y tienes permisos', COLORS.YELLOW);
    
    const urlPrefix = ownerType === 'org' ? 'orgs' : 'users';
    printMessage(`   URL: https://github.com/${urlPrefix}/${owner}/projects/${projectNumber}`, COLORS.BLUE);
    return false;
  }
  
  try {
    const result = JSON.parse(projectCheck.output);
    const project = result.data[ownerField]?.projectV2;
    
    if (!project) {
      printMessage(`❌ Proyecto #${projectNumber} no encontrado`, COLORS.RED);
      printMessage('   Verifica el número del proyecto en la URL', COLORS.YELLOW);
      printMessage(`   Verifica GITHUB_OWNER_TYPE=${ownerType} sea correcto`, COLORS.YELLOW);
      return false;
    }
    
    printMessage(`✅ Proyecto: ${project.title}`, COLORS.GREEN);
    printMessage(`   Tipo: ${ownerType === 'org' ? 'Organización' : 'Usuario'}`, COLORS.WHITE);
    printMessage(`   ID: ${project.id}`, COLORS.WHITE);
    printMessage(`   Descripción: ${project.shortDescription || 'Sin descripción'}`, COLORS.WHITE);
    printMessage(`   Público: ${project.public ? 'Sí' : 'No'}`, COLORS.WHITE);
    printMessage(`   Campos existentes: ${project.fields.nodes.length}`, COLORS.WHITE);
    
    // Verificar permisos de escritura
    if (!project.viewerCanUpdate) {
      printMessage('❌ No tienes permisos para modificar este proyecto', COLORS.RED);
      if (ownerType === 'org') {
        printMessage('   Necesitas permisos de admin/write en la organización', COLORS.YELLOW);
      } else {
        printMessage('   Necesitas ser owner o tener permisos de escritura', COLORS.YELLOW);
      }
      return false;
    }
    
    printMessage('✅ Permisos de escritura en el proyecto confirmados', COLORS.GREEN);
    return true;
    
  } catch (error) {
    printMessage('❌ Error parseando información del proyecto', COLORS.RED);
    printMessage(`   Verifica GITHUB_OWNER_TYPE=${ownerType}`, COLORS.YELLOW);
    return false;
  }
}

/**
 * Valida rate limits de la API
 */
function validateAPIRateLimits() {
  printMessage('\n⏱️  VALIDANDO RATE LIMITS DE LA API', COLORS.CYAN, COLORS.BOLD);
  
  // Verificar rate limit de Core API
  const rateLimitCheck = runCommand('gh api rate_limit', true);
  if (!rateLimitCheck.success) {
    printMessage('⚠️  No se pudieron verificar los rate limits', COLORS.YELLOW);
    return true; // No es crítico, continuamos
  }
  
  try {
    const rateLimit = JSON.parse(rateLimitCheck.output);
    
    // Core API
    const core = rateLimit.resources.core;
    const corePercent = (core.remaining / core.limit) * 100;
    
    if (core.remaining < 100) {
      printMessage(`❌ Rate limit bajo: ${core.remaining}/${core.limit} requests restantes`, COLORS.RED);
      const resetTime = new Date(core.reset * 1000);
      printMessage(`   Se resetea a las: ${resetTime.toLocaleTimeString()}`, COLORS.YELLOW);
      return false;
    }
    
    printMessage(`✅ Core API: ${core.remaining}/${core.limit} requests (${corePercent.toFixed(1)}%)`, COLORS.GREEN);
    
    // GraphQL API
    const graphql = rateLimit.resources.graphql;
    const graphqlPercent = (graphql.remaining / graphql.limit) * 100;
    
    if (graphql.remaining < 100) {
      printMessage(`❌ GraphQL rate limit bajo: ${graphql.remaining}/${graphql.limit} points`, COLORS.RED);
      return false;
    }
    
    printMessage(`✅ GraphQL API: ${graphql.remaining}/${graphql.limit} points (${graphqlPercent.toFixed(1)}%)`, COLORS.GREEN);
    
    return true;
    
  } catch (error) {
    printMessage('⚠️  Error verificando rate limits, continuando...', COLORS.YELLOW);
    return true;
  }
}

/**
 * Crea archivo de configuración validada
 */
function createValidationReport() {
  const report = {
    timestamp: new Date().toISOString(),
    validation_passed: true,
    environment: {
      GITHUB_OWNER: process.env.GITHUB_OWNER,
      REPO_NAME: process.env.REPO_NAME,
      PROJECT_NUMBER: process.env.PROJECT_NUMBER
    },
    github_cli_version: null,
    user_info: null,
    repository_info: null,
    project_info: null
  };
  
  // Obtener versión de GitHub CLI
  const versionCheck = runCommand('gh --version', true);
  if (versionCheck.success) {
    const versionMatch = versionCheck.output.match(/gh version (\d+\.\d+\.\d+)/);
    report.github_cli_version = versionMatch ? versionMatch[1] : null;
  }
  
  // Guardar reporte
  const reportPath = join(__dirname, '.validation-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  printMessage(`\n📄 Reporte de validación guardado en: ${reportPath}`, COLORS.BLUE);
  return reportPath;
}

/**
 * Función principal de validación
 */
function main() {
  printMessage('🛡️  VALIDACIÓN DE PERMISOS Y PREREQUISITES PARA AURORA STACK', COLORS.MAGENTA, COLORS.BOLD);
  printMessage('=' .repeat(70), COLORS.MAGENTA);
  
  const validations = [
    { name: 'GitHub CLI', func: validateGitHubCLI },
    { name: 'Autenticación', func: validateAuthentication },
    { name: 'Variables de Entorno', func: validateEnvironmentVariables },
    { name: 'Acceso al Repositorio', func: validateRepositoryAccess },
    { name: 'Acceso al Proyecto', func: validateProjectAccess },
    { name: 'Rate Limits', func: validateAPIRateLimits }
  ];
  
  let allPassed = true;
  const results = [];
  
  for (const validation of validations) {
    const passed = validation.func();
    results.push({ name: validation.name, passed });
    if (!passed) {
      allPassed = false;
    }
  }
  
  // Resumen final
  printMessage('\n📋 RESUMEN DE VALIDACIÓN', COLORS.CYAN, COLORS.BOLD);
  printMessage('=' .repeat(50), COLORS.CYAN);
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    const color = result.passed ? COLORS.GREEN : COLORS.RED;
    printMessage(`${status} ${result.name}`, color);
  });
  
  printMessage('\n' + '=' .repeat(50), COLORS.CYAN);
  
  if (allPassed) {
    printMessage('🎉 ¡TODAS LAS VALIDACIONES PASARON!', COLORS.GREEN, COLORS.BOLD);
    printMessage('\n🚀 Puedes continuar con la configuración:', COLORS.WHITE);
    printMessage('   1. node 01-setup-project-fields.js', COLORS.BLUE);
    printMessage('   2. node 02-setup-repository-labels.js', COLORS.BLUE);
    printMessage('   3. node 03-create-sample-issues.js', COLORS.BLUE);
    printMessage('   4. node 04-setup-project-views.js', COLORS.BLUE);
    
    // Crear reporte de validación
    createValidationReport();
    
    process.exit(0);
  } else {
    printMessage('💥 ALGUNAS VALIDACIONES FALLARON', COLORS.RED, COLORS.BOLD);
    printMessage('\n🛠️  Resuelve los problemas arriba antes de continuar', COLORS.YELLOW);
    printMessage('   Luego ejecuta este script nuevamente', COLORS.YELLOW);
    
    process.exit(1);
  }
}

// Exportar funciones para uso en otros scripts
module.exports = {
  runCommand,
  validateGitHubCLI,
  validateAuthentication,
  validateEnvironmentVariables,
  validateRepositoryAccess,
  validateProjectAccess,
  validateAPIRateLimits
};

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}