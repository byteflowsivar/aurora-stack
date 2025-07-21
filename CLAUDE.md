# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aurora Stack is a multi-tenant application platform with integrated authentication services. The project is structured as a monorepo with infrastructure services and application components.

## Architecture

- **Containerized Services**: Uses Docker Compose for service orchestration
- **Authentication**: Keycloak identity provider with PostgreSQL backend
- **Database**: Separate PostgreSQL instances for Keycloak and Aurora applications
- **Network Isolation**: Services use dedicated Docker networks (keycloak-network, aurora-network)
- **Structured Documentation**: Organized documentation following a project lifecycle approach

## Key Services

1. **Keycloak Authentication Server**
   - Runs on port 8089 (HTTP) and 8443 (HTTPS)
   - Uses PostgreSQL database (keycloak_db)
   - Configured for development mode
   - Custom themes available in packages/keycloak-themes/

2. **Aurora Database**
   - PostgreSQL instance on port 5432
   - Dedicated for Aurora application data
   - Isolated network configuration

## Development Commands

### Docker Operations
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View service logs
docker compose logs [service_name]

# Rebuild services
docker compose up --build
```

### Environment Configuration
- Environment variables are defined in `.env` file
- Contains credentials for Keycloak admin, database connections
- Keycloak admin: admin/keycloak (development)

## Project Structure

```
aurora-stack/
├── apps/                    # Application components (currently empty)
├── packages/               # Shared packages and themes
│   └── keycloak-themes/    # Custom Keycloak themes
├── infrastructure/         # Infrastructure configuration (currently empty)
├── scripts/               # Build and deployment scripts (currently empty)
├── docs/                  # Structured project documentation
│   ├── 01-requerimientos/ # Requirements documentation
│   ├── 02-diseno/        # Design documentation
│   ├── 03-implementacion/ # Implementation guides
│   ├── 04-operacion/     # Operations documentation
│   └── 05-evolucion/     # Evolution and maintenance
└── docker-compose.yml    # Service orchestration
```

## Documentation Structure

The project follows a structured documentation approach:
- **01-requerimientos**: Business and technical requirements
- **02-diseno**: System design including Keycloak, database, and interfaces
- **03-implementacion**: Implementation milestones, development guides, and testing
- **04-operacion**: Deployment and operational manuals
- **05-evolucion**: Project evolution and maintenance

## Network Configuration

Services are isolated using Docker networks:
- `keycloak-network`: For Keycloak and its database
- `aurora-network`: For Aurora applications and database

## Health Checks

Both PostgreSQL instances include health checks with 5-second intervals and 10 retries to ensure service reliability.