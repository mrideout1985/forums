---
name: openapi-codegen
description: Generate application code from an OpenAPI spec — models, controllers, services, repositories
---

# OpenAPI Code Generation

When generating application code from an OpenAPI spec:

1. Validate the spec: endpoints, schemas, auth, relationships
2. Design architecture: controllers by resource/domain, service layer, DTOs
3. Generate in order: models/DTOs → controllers → services → repositories
4. Include: validation, error handling, logging, unit tests
5. Never expose JPA entities directly — always use DTOs
6. Ask before deciding: database setup, Docker config, auth method, test scope
