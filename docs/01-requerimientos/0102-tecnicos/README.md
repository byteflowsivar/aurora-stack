# 0102 - Técnicos

Esta sección define **el cómo** del proyecto Aurora Stack desde la perspectiva técnica, documentando decisiones arquitectónicas, tecnologías y razonamientos técnicos.

## 📂 Documentos

### arquitectura.md
**Diagramas y visión arquitectónica**

Contiene la arquitectura del sistema usando metodología C4:
- **Contexto**: Relación del sistema con usuarios y sistemas externos
- **Contenedores**: Aplicaciones y servicios principales
- **Componentes**: Estructura interna de cada contenedor
- **Código**: Detalles de implementación relevantes

### stack.md
**Tecnologías y herramientas utilizadas**

Documenta el ecosistema tecnológico:
- Frameworks y librerías principales
- Bases de datos y sistemas de persistencia
- Herramientas de desarrollo y CI/CD
- Servicios de infraestructura
- Justificación de cada elección tecnológica

### decisiones.md
**ADRs (Architecture Decision Records)**

Registro histórico de decisiones técnicas importantes:
- Contexto de cada decisión
- Alternativas consideradas
- Decisión tomada y justificación
- Consecuencias e impacto

## 🎯 Objetivos de esta Sección

- **Transparencia**: Documentar el razonamiento detrás de decisiones técnicas
- **Consistencia**: Mantener coherencia arquitectónica en el proyecto
- **Onboarding**: Facilitar la comprensión técnica a nuevos desarrolladores
- **Evolución**: Permitir evaluación de decisiones pasadas para futuras mejoras

## 📐 Formato de ADRs

Utilizamos el formato estándar para Architecture Decision Records:

```markdown
## [ADR-001] Título de la Decisión

**Fecha**: YYYY-MM-DD  
**Estado**: [Propuesta | Aceptada | Rechazada | Deprecada | Supersedida por ADR-XXX]

### Contexto
Descripción del problema, necesidad o situación que requiere una decisión.

### Alternativas Consideradas

#### Opción 1: [Nombre]
- **Pros**: Ventaja 1, Ventaja 2
- **Contras**: Desventaja 1, Desventaja 2
- **Esfuerzo**: Estimación

#### Opción 2: [Nombre]
- **Pros**: Ventaja 1, Ventaja 2
- **Contras**: Desventaja 1, Desventaja 2
- **Esfuerzo**: Estimación

### Decisión
Opción elegida y justificación principal.

### Consecuencias
#### Positivas
- Beneficio 1
- Beneficio 2

#### Negativas
- Limitación 1
- Limitación 2

#### Neutras
- Cambio 1
- Cambio 2
```

## 🔧 Ejemplos de Decisiones Típicas

- Elección de framework web
- Estrategia de autenticación
- Base de datos y modelo de datos
- Arquitectura de microservicios vs monolito
- Herramientas de CI/CD
- Estrategia de testing
- Patrones de diseño principales

## 🔄 Mantenimiento

### Cuándo crear un ADR:
- Decisiones que afectan la arquitectura del sistema
- Elección entre múltiples alternativas técnicas
- Cambios significativos en el stack tecnológico
- Patrones de diseño adoptados en el proyecto

### Actualización de documentos:
- **arquitectura.md**: Al cambiar la estructura del sistema
- **stack.md**: Al agregar/cambiar tecnologías
- **decisiones.md**: Al tomar nuevas decisiones técnicas importantes