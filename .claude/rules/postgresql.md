---
paths:
  - "**/*.sql"
  - "backend/**/model/**/*.java"
  - "backend/**/entity/**/*.java"
  - "backend/**/repository/**/*.java"
---

# PostgreSQL Standards

## Schema Design
- Use `BIGSERIAL PRIMARY KEY`, `CITEXT` for case-insensitive text, `TIMESTAMPTZ` (not `TIMESTAMP`)
- Use ENUM types for constrained value sets; use domains for reusable constraints
- Use `JSONB` (not `JSON`) for semi-structured data
- Always add `CHECK` constraints to enforce data validity

## Indexing
- GIN indexes for JSONB/array columns queried with `@>`, `?`, `&&`
- GiST indexes for range types and geometric data
- Partial indexes for filtered queries: `WHERE status = 'active'`
- Expression indexes for computed values: `lower(email)`
- Covering indexes with `INCLUDE` for avoiding heap lookups
- Use cursor-based pagination (`WHERE id > $last_id`) not `OFFSET` for large tables

## Query Patterns
- Use JSONB containment operators (`@>`) — never cast to `::text` for searching
- Use range conditions for dates (`order_date >= '2024-01-01'`) not `YEAR()` functions
- Avoid functions in `WHERE` clauses that prevent index usage
- Use window functions instead of correlated subqueries
- Use `UNION ALL` over complex `OR` conditions for better optimization
- Batch inserts over row-by-row inserts

## Security
- Use parameterized queries exclusively — never string concatenation
- Implement Row Level Security (RLS) for multi-tenant data
- Principle of least privilege: `GRANT SELECT, INSERT, UPDATE ON specific_table TO app_user`

## SQL Code Quality
- Format SQL consistently: keywords uppercase, each clause on its own line
- Explicit column selection — avoid `SELECT *`
- Use proper JOIN types (`INNER` vs `LEFT`) — don't use `DISTINCT` to mask missing JOIN conditions
- Avoid N+1 queries — join or use batch fetching
