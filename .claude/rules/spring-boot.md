---
paths:
  - "backend/**/*.java"
---

# Spring Boot Standards

## Structure
- Organize by feature/domain (e.g., `com.rideout.forums.post`), not by layer
- Use `@Component`, `@Service`, `@Repository`, `@RestController` appropriately

## Dependency Injection
- Always use constructor injection for required dependencies
- Declare dependency fields as `private final`

## Configuration
- Use `application.yml` for configuration (preferred over `.properties`)
- Use `@ConfigurationProperties` for type-safe config binding
- Never hardcode secrets — use environment variables

## Web Layer
- Use DTOs in the API layer — never expose JPA entities directly
- Use Bean Validation (`@Valid`, `@NotNull`, `@Size`) on request DTOs
- Use `@ControllerAdvice` + `@ExceptionHandler` for global error handling

## Service Layer
- All business logic in `@Service` classes
- Services must be stateless
- Use `@Transactional` at the service method level, as granular as needed

## Data Layer
- Extend `JpaRepository` or `CrudRepository` for standard operations
- Use `@Query` or Criteria API for complex queries
- Use DTO projections to fetch only needed data

## Logging
- Use SLF4J: `private static final Logger logger = LoggerFactory.getLogger(MyClass.class);`
- Use parameterized messages: `logger.info("User {}", userId)` — never string concatenation

## Security
- Use Spring Security for auth
- Always encode passwords with BCrypt
- Prevent SQL injection via Spring Data JPA or parameterized queries
