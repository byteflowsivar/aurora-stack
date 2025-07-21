# 0202 - Base de Datos

Esta sección documenta el **diseño completo de la base de datos** para Aurora Stack, incluyendo modelo de datos, esquemas y estrategias de migración.

## 📂 Documentos

### modelo-er.md
**Diagrama entidad-relación actualizado**

Contiene el diseño completo de la base de datos:
- **Diagrama ER**: Entidades, atributos y relaciones
- **Diccionario de Datos**: Descripción detallada de cada tabla y campo
- **Restricciones**: Claves primarias, foráneas y constraints
- **Índices**: Estrategias de optimización y rendimiento

### migrations/
**Scripts SQL históricos**

Directorio con el historial de cambios del esquema:
- **Versiones**: Scripts numerados secuencialmente
- **Rollback**: Scripts para revertir cambios
- **Seeds**: Datos iniciales y de referencia
- **Procedimientos**: Stored procedures y funciones

## 🗃️ Configuración Actual

### Base de Datos Aurora
- **Motor**: PostgreSQL 16 Alpine
- **Puerto**: 5432
- **Base de Datos**: auroradb
- **Usuario**: aurora
- **Red Docker**: aurora-network

### Volúmenes y Persistencia
- **Volumen**: aurora_db_data
- **Ubicación**: /var/lib/postgresql/data
- **Backup**: Configuración de respaldos automáticos

## 📊 Estructura del Modelo de Datos

### Formato de Documentación:

```markdown
## Entidad: [Nombre de la Tabla]

### Propósito
Descripción de la entidad y su función en el sistema.

### Campos
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | SERIAL | PK, NOT NULL | Identificador único |
| nombre | VARCHAR(255) | NOT NULL | Nombre descriptivo |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Fecha de creación |

### Relaciones
- **Padre**: Referencia a tabla_padre (parent_id)
- **Hijos**: Referenciado por tabla_hija (entity_id)

### Índices
- **PK**: id (automático)
- **UK**: unique_constraint_name (campo1, campo2)
- **IDX**: idx_nombre_campo (campo) - Para búsquedas frecuentes

### Restricciones de Negocio
- Campo debe ser único por organización
- Validación de formato específico
```

## 🔄 Gestión de Migraciones

### Estructura de Migrations:
```
migrations/
├── V001__initial_schema.sql
├── V002__add_user_tables.sql
├── V003__add_audit_tables.sql
├── rollback/
│   ├── R001__rollback_initial.sql
│   └── R002__rollback_users.sql
└── seeds/
    ├── S001__reference_data.sql
    └── S002__demo_data.sql
```

### Convenciones de Naming:
- **Migraciones**: `V###__description.sql`
- **Rollbacks**: `R###__rollback_description.sql`
- **Seeds**: `S###__data_description.sql`

### Ejemplo de Migración:
```sql
-- V001__initial_schema.sql
-- Descripción: Creación de esquema inicial para Aurora Stack
-- Autor: [Nombre]
-- Fecha: 2024-XX-XX

BEGIN;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear esquema de auditoría
CREATE SCHEMA IF NOT EXISTS audit;

-- Tabla de organizaciones
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_active ON organizations(active);

COMMIT;
```

## 🔍 Estrategias de Rendimiento

### Índices Principales:
- **Búsquedas frecuentes**: Campos usados en WHERE
- **Ordenamiento**: Campos usados en ORDER BY
- **Joins**: Claves foráneas importantes
- **Búsqueda de texto**: Índices GIN para JSONB

### Particionamiento:
```sql
-- Ejemplo de particionamiento por fecha
CREATE TABLE audit_logs (
    id BIGSERIAL,
    event_date DATE NOT NULL,
    user_id UUID,
    action VARCHAR(50),
    details JSONB
) PARTITION BY RANGE (event_date);

-- Particiones mensuales
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## 🔒 Seguridad de Datos

### Configuración de Usuarios:
```sql
-- Usuario de aplicación con permisos limitados
CREATE USER aurora_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE auroradb TO aurora_app;
GRANT USAGE ON SCHEMA public TO aurora_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO aurora_app;

-- Usuario de solo lectura para reportes
CREATE USER aurora_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE auroradb TO aurora_readonly;
GRANT USAGE ON SCHEMA public TO aurora_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO aurora_readonly;
```

### Auditoría:
```sql
-- Función de auditoría automática
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.change_log (
        table_name,
        operation,
        old_values,
        new_values,
        user_id,
        timestamp
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        current_setting('app.current_user_id', true),
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## 🔄 Procedimientos de Mantenimiento

### Backup Regular:
```bash
# Backup completo
docker exec aurora-postgres pg_dump -U aurora auroradb > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo esquema
docker exec aurora-postgres pg_dump -U aurora --schema-only auroradb > schema_$(date +%Y%m%d).sql

# Backup solo datos
docker exec aurora-postgres pg_dump -U aurora --data-only auroradb > data_$(date +%Y%m%d).sql
```

### Monitoreo de Performance:
```sql
-- Consultas lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;

-- Índices no utilizados
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Tamaño de tablas
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```